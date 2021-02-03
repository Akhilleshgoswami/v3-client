import {
  KeyPairWithYCoordinate,
  keyPairFromData,
} from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import { SignOnboardingAction } from '../eth-signing';
import { stripHexPrefix } from '../eth-signing/helpers';
import {
  RequestMethod,
  axiosRequest,
} from '../lib/axios';
import {
  SigningMethod,
  AccountResponseObject,
  Data,
  UserResponseObject,
  ApiKeyCredentials,
  OnboardingActionString,
} from '../types';

export default class Onboarding {
  readonly host: string;
  readonly signer: SignOnboardingAction;

  constructor(
    host: string,
    web3: Web3,
    networkId: number,
  ) {
    this.host = host;
    this.signer = new SignOnboardingAction(web3, networkId);
  }

  // ============ Request Helpers ============

  protected async post(
    endpoint: string,
    data: {},
    ethereumAddress: string,
    signature: string | null = null,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<Data> {
    const url: string = `/v3/${endpoint}`;
    return axiosRequest({
      url: `${this.host}${url}`,
      method: RequestMethod.POST,
      data,
      headers: {
        'DYDX-SIGNATURE': signature || await this.signer.sign(
          ethereumAddress,
          signingMethod,
          { action: OnboardingActionString.ONBOARDING },
        ),
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  // ============ Requests ============

  /**
   * @description create a user, account and apiKey in one onboarding request
   *
   * @param {
   * @starkKey is the unique public key for starkwareLib operations used in the future
   * @starkKeyYCoordinate is the Y Coordinate of the unique public key for starkwareLib
   * operations used in the future
   * }
   * @param ethereumAddress of the account
   * @param signature validating the request
   * @param signingMethod for the request
   */
  async createUser(
    params: {
      starkKey: string,
      starkKeyYCoordinate: string,
    },
    ethereumAddress: string,
    signature?: string,
    signingMethod?: SigningMethod,
  ): Promise<{
    apiKey: ApiKeyCredentials,
    user: UserResponseObject,
    account: AccountResponseObject,
  }> {
    return this.post(
      'onboarding',
      params,
      ethereumAddress,
      signature,
      signingMethod,
    );
  }

  // ============ Other ============

  /**
   * @description Derive a STARK key pair deterministically from an Ethereum key.
   */
  async deriveStarkKey(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<KeyPairWithYCoordinate> {
    const signature = await this.signer.sign(
      ethereumAddress,
      signingMethod,
      { action: OnboardingActionString.KEY_DERIVATION },
    );
    return keyPairFromData(Buffer.from(stripHexPrefix(signature), 'hex'));
  }
}
