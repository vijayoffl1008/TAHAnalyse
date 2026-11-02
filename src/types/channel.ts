// ── Feed Channel (channel/*, feed/*) ─────────────────────────────────────────

export interface ChannelServer {
  _id: string;
  name: string;
  api_url: string;
}

export interface Channel {
  _id: string;
  bname: string;
  login_status: string;
  conn_status: string;
}

export interface ChannelConnectionDetails {
  socket_url: string;
  bname: string;
  instruments: string[];
}
