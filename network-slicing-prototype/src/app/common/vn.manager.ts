export class VnManager {
  public aDimensions:any[];
  public bDimensions: any[];
  public cDimensions: any[];

  public cids: any[];

  constructor() {
    this.aDimensions = [];
    this.bDimensions = [];
    this.cDimensions = [];
    this.cids = [
      {cid: 'a', name: 'Computing'},
      {cid: 'b', name: 'Storage'},
      {cid: 'c', name: 'Cloud'}
    ]
  }

  public getAllVirtualNodes(){
    let vns = [];
    this.aDimensions.forEach((vn) => {
      vns.push(vn);
    });
    this.bDimensions.forEach((vn) => {
      vns.push(vn);
    });
    this.cDimensions.forEach((vn) => {
      vns.push(vn);
    });
    return vns;
  }
}
