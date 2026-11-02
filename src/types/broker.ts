// ── Broker Account (baccount/*) ───────────────────────────────────────────────

export interface BrokerAccount {
  _id: string;
  name: string;
  client_id: string;
  /** e.g. 'alice_blue', 'angel_broking' */
  bname: string;
  state: "active" | "inactive";
  acc_id: string;
}

export interface AddBrokerDTO {
  name: string;
  client_id: string;
  bname: string;
  api_key?: string;
  api_secret?: string;
  acc_id?: string;
}

export interface UpdateBrokerDTO extends AddBrokerDTO {
  _id: string;
}

export interface ConnectBrokerDTO {
  _id: string;
  bname: string;
}
