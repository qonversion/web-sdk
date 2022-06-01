export class NetworkConfig {
  canSendRequests: boolean;

  constructor(canSendRequests: boolean = true) {
    this.canSendRequests = canSendRequests;
  }
}
