import Stripe from "stripe";
import { stripe } from "../../api-liberaries/config/stripe";
import { empty, isObject, isString } from "../../api-liberaries/utilities/utils";
import { has, isFinite } from "lodash";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import { ChargeCreateParams } from "stripe/cjs/resources/Charges";

class StripeService {
  getStripeInstance() {
    if (stripe) {
      return stripe;
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  /**
   * create a customer record on stripe
   * * Method wrapped round - stripe.customers.create
   * @param {*} customer_creation_payload
   * @returns
   */
  async createPaymentIntent(customer_creation_payload: { amount: number; currency?: string; source: string; }) {
    try {
      if(!customer_creation_payload || !isObject(customer_creation_payload)){
        return BaseExceptions.badRequest("Invalid customer creation payload supplied. Customer creation payload must be a key/pair object.");
      }

      const stripe = this.getStripeInstance();
      const stripe_token: string = customer_creation_payload.source;
      const amount: number = customer_creation_payload.amount!;
      // const customer = await stripe?.customers?.create({ email: customer_creation_payload?.email });
      // await stripe.paymentMethods.attach(stripe_token, {
      //   customer: customer.id,
      // });
      // await stripe.customers.update(customer.id, {
      //   invoice_settings: {
      //     default_payment_method: stripe_token,
      //   },
      // });
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'gbp',
        payment_method: stripe_token, // pm_...
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      return SuccessResponse.jsonResponse(paymentIntent);
    } catch(e) {
      return StripeService.humanizeStripeError(e as DynamicObjectType, "Internal server error.");
    }
  }

  /**
   * Wrapper around stripe charges create api call
   * * Method wrapped round - stripe.charges.create
   * @param {*} payment_payload
   * @returns
   */
  async charge(payment_payload: ChargeCreateParams | undefined) {
    try {
      if(!payment_payload || !has(payment_payload, "amount") || !isFinite(payment_payload.amount) || parseFloat(String(payment_payload.amount)) <= 0) {
          return BaseExceptions.badRequest("Missing required/invalid field \"amount\" in payment payload. Amount must be a number greater than 0 (zero)");
      }
      if((!has(payment_payload, "source") && !payment_payload["source"]) && (!has(payment_payload, "customer") && !payment_payload["customer"])) {
        return BaseExceptions.badRequest("Missing required key \"source\" or \"customer\".")
      }

      payment_payload.currency = has(payment_payload, "currency") && isString(payment_payload.currency) ? payment_payload.currency : 'gbp';
      payment_payload.amount = parseFloat(String(payment_payload.amount));

      const stripe = this.getStripeInstance();
      const charge = await stripe.charges.create(payment_payload);
      return SuccessResponse.jsonResponse(charge);
    } catch(e) {
      return BaseExceptions.internalServerError(StripeService.humanizeStripeError(e as DynamicObjectType, "Internal server error."));
    }
  }

  /**
   *
   * @param {*} error
   */
  static humanizeStripeError (error: DynamicObjectType, message_if_not_stripe_error: string = '') {
    try {
      if(!isObject(error) || !has(error, "type") || error.type.toString().toLowerCase().indexOf("stripe") === -1) {
        return message_if_not_stripe_error;
      }
      if(!has(error, "raw") || !isObject(error.raw)) {
        return message_if_not_stripe_error;
      }
      const stripe_error = error.raw;
      const custom_stripe_error_messages: DynamicObjectType = StripeService.getStripeCustomCodeErrorMessages();
      if(!empty(stripe_error) && !empty(custom_stripe_error_messages) && isObject(custom_stripe_error_messages)) {
        if(has(stripe_error, "decline_code") && custom_stripe_error_messages[stripe_error.decline_code]) {
          return custom_stripe_error_messages[stripe_error.decline_code];
        } else if(has(stripe_error, "code") && custom_stripe_error_messages[stripe_error.code]) {
          return custom_stripe_error_messages[stripe_error.code];
        } else if(custom_stripe_error_messages.default) {
          return custom_stripe_error_messages.default;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "Sorry, an unexpected error occurred while trying to communicate with our payment processor."
  }

  /**
   * Get custom defined error messages for strip error codes
   * @returns
   */
  static getStripeCustomCodeErrorMessages() {
    return ({
      insufficient_funds: "Your card has insufficient funds.",
      card_declined: 'Your card was declined.',
      expired_card: 'Your card has expired.',
      incorrect_cvc: "Your card's security code is incorrect.",
      processing_error: 'An error occurred while processing your card. Try again in a little bit.',
      incorrect_number: "Your card number is incorrect/invalid.",
      missing: 'Sorry! There is no active card saved on file on this account.',
      default: "Sorry, an unexpected error occurred while trying to communicate with our payment processor."
    });
  }
}

export default StripeService;
