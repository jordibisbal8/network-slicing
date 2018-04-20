import {Injectable} from '@angular/core';
import {HttpClient} from "../http-client.component";

@Injectable()
export class EvaluationService {
  constructor(public http: HttpClient)
  {}

  savePeeringNodes(data){
    let url = '/api/evaluation/peering-node';
    return this.http.post(url, data)
      .map(res => res.json())
  }
  partitioning(data) {
    let url = '/api/evaluation/virtual-network';
    return this.http.post(url, data)
      .map(res => res.json())
  }
}
