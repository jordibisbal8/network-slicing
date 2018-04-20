import {Injectable} from '@angular/core';
import {HttpClient} from "../http-client.component";

@Injectable()
export class SubstrateNetworkService {
  constructor(public http: HttpClient)
  {}

  getPeeringNodes() {
    let url = '/api/user/peering-node';
    return this.http.get(url)
      .map(res => res.json())
  }

  savePeeringNodes(data){
    let url = '/api/user/peering-node';
    return this.http.post(url,data)
      .map(res => res.json())
  }
}
