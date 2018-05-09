import {Component, OnInit, ViewChild} from "@angular/core";
import { Graph, GraphMLParser, AttributeMap } from 'graphml-js';
import {HttpClient} from "../http-client.component";
import {VirtualNodeDialogComponent} from "../virtual-network/dialogs/virtual-node.dialog.component";
import {MdDialog, MdSnackBar} from "@angular/material";
import {Static_Values} from "../static_values";
import {EvaluationService} from "../services/evaluation-service";

declare let vis: any; // load library also in index.html

@Component({
  selector: 'evaluation',
  templateUrl: './evaluation.component.html'
})
export class EvaluationComponent implements OnInit {

  peeringNodes: any [] = [];
  peeringLinks: any [] = [];
  intraLinks: any[] = [];

  numOfRequest: number = 1;

  /** TEST CONFIG **/
  arrivalRate = 3;
  runs = 30;
  requests = 100;
  lifetime = 10000; //L1 = 10000, L2= 25000

  /** SCENARIO CONFIG 5 LOCATIONS **/
  numOfInPs = 3;
  numOfTypes = 5;

  InPs = ['0xde501181911262542393beb7298b2f22e7c64416',
    '0xd358821084f42c7e60ae0ca89b4337eb0cb24bb0',
    '0xa18a26a37141f10f5874a30237dac76dd8994bdb',
    '0xc6c33c61f4af52d75b0e54b4bdfebf73c2fc2713'
  ];

  selectedInPs = [];

  public network;

  public options = {
    nodes: {
      physics: true,
      shape: 'box',
      widthConstraint:
        { minimum: 30},
      heightConstraint:
        { minimum: 30},
      color: {
        background: 'white',
        border: 'black',
        highlight: {background: '#00838F', border: 'black'}, hover: {background: 'white', border: '#00838F'}
      },
      font: {
        size: 30,
      },
      group: 0,
      size: 27,
      shapeProperties: {borderRadius: 0},
    },
    edges: {
      font: {align: 'top'},
      color: {
        color: 'black',
        highlight: '#00838F', hover: '#00838F'
      },
      smooth: false,
    },
    interaction: {hover: true},
    manipulation: {
      enabled: false,
    }
  };


  @ViewChild('mynetwork') public container;

  private locationsList = new Static_Values().locations;
  private locations_with_broadcast = new Static_Values().locations_with_broadcast;
  private types = new Static_Values().types_ev;



  constructor(public http: HttpClient,
              public dialog: MdDialog,
              public snackBar: MdSnackBar,
              public evaluationService: EvaluationService){
  }

  ngOnInit(){
    this.getInPs();
    this.getGraphML('condensed_west_europe_new.graphml');
  }

  // Prices from Amazon EC2 pricing
  checkResourceCost(type) {
    if (type === 'A') {
      return this.getRandomFloat(10, 12)// We multiply per 100 because the blockchain does not accept floats
    }
    if (type === 'B') {
      return this.getRandomFloat(10, 12);
    }
    if (type === 'C') {
      return this.getRandomFloat(10, 12);
    }
    if (type === 'D') {
      return this.getRandomFloat(10, 12);
    }
    if (type === 'E') {
      return this.getRandomFloat(10, 12);
    }
  }

  getInPs() {
    for (let i = 0; i < this.numOfInPs; i++) {
      this.selectedInPs.push(this.InPs[i]);
    }
  }

  getGraphML(filename: string){
    let path = 'assets/graphs/';
    let graphmlText;
    this.http.get(path + filename).subscribe(res => {
      graphmlText = res["_body"];
      let parser = new GraphMLParser();
      parser.parse(graphmlText, (err, graphs) => {
        // asn id 20965 European NREN Model
        graphs.nodes.forEach(node => {
          if (node._attributes.Country === "Germany" || node._attributes.Country === "Switzerland"|| node._attributes.Country === "France"
            || node._attributes.Country === "Italy" || node._attributes.Country === "Spain")
            this.createSubstrateNode(node);
        });
        graphs.edges.forEach(edge => {
          this.peeringLinks.push({
            id: 'tmp_' + Math.random(),
            from: edge._source,
            to: edge._target,
            capacity: this.getRandomInt(4000,6000)
          })
        });
      });
    });
  }

  createSubstrateNode(node) {
    let attributes = node._attributes;
    for (let i = 0; i < this.selectedInPs.length; i++) {
      let resources = [];
      for (let j = 0; j < this.numOfTypes; j++) {
        let type = this.types[Math.floor(Math.random() * this.types.length)];
        // TO check it is not repeated
        if (resources.map(x => x.type).indexOf(type) === -1) {
          let unitary_cost = this.checkResourceCost(type);
          resources.push({
            type: type,
            unitary_cost: unitary_cost,
            capacity: 5
          });
        }
        else {
          j --;
        }
      }
      let _id = 'tmp_' + Math.random();
      this.peeringNodes.push({
        InP: this.selectedInPs[i],
        country: attributes.Country,
        label: attributes.label,
        id: node.id, //idRouter
        _id: _id,
        resources: resources
      });
      this.intraLinks.push({
        InP: this.selectedInPs[i],
        id: 'tmp_' + Math.random(),
        from: _id,
        to: node.id,
      })
    }
  }

  enterInPsPeeringNodes() {
    let data = {peeringNodes: this.peeringNodes, peeringLinks: this.peeringLinks};
    this.evaluationService.savePeeringNodes(data).subscribe(res => {
      this.snackBar.open("Substrate networks added into the blockchain", 'X', {
        duration:5000
      });
    })
  }

  start(run) {
    if (run <= this.runs) {
      this.partitioning(true, () => {
        setTimeout(() => {
          run = run + 1;
          console.log("-- run", run);
          this.start(run);
        }, this.lifetime);
      })
    }
  }

  partitioning(isNewTest,callback) {
    this.partitioningRequest(isNewTest);
    if (this.numOfRequest < this.requests ) {
      setTimeout(() => {
        console.log("-- this.counter", this.numOfRequest);
        this.numOfRequest ++;
        this.partitioning(false,callback);
      }, 5000 / this.arrivalRate); //
    }
    else {
      this.numOfRequest = 1;
      return callback();
    }
  }

  partitioningRequest(isNewTest) {
    let nodeCount = 5 //this.getRandomInt(5, 10);
    let data = this.getScaleFreeNetwork(nodeCount);
    let data2 = this.prepareVNRequest(data.nodes, data.edges, isNewTest);
    this.evaluationService.partitioning(data2).subscribe(res => {
      this.snackBar.open("Virtual network successfully embedded", 'X', {
        duration:5000
      });
    }, err => {
      this.snackBar.open(err._body, 'X', {
        duration:5000
      });
    });

    // initialize your network
    this.network = new vis.Network(this.container.nativeElement, data, this.options);
    this.network.on("doubleClick", params => {
      if (params.nodes[0]) {
        this.network.body.data.nodes.forEach(node => {
          if (node.id === params.nodes[0]){
            let dialogRef = this.dialog.open(VirtualNodeDialogComponent, {
              width: '1000px'
            });
            dialogRef.componentInstance.inputNode = node;
          }
        });
      }
    });
  }

  getScaleFreeNetwork(nodeCount) {
    let nodes = [];
    let edges = [];
    let connectionCount = [];
    for (let i = 0; i < nodeCount; i++) {
      let location = this.locations_with_broadcast[Math.floor(Math.random() * this.locations_with_broadcast.length)];
      let type = this.types[Math.floor(Math.random()*this.types.length)];
      nodes.push({
        id: i,
        _id: 'tmp_' + Math.random(),
        label: type,
        type: type,
        location: location.country,
        title: location.country,
        upperBoundCost: 200,
        computing_demand: this.getRandomInt(1,3)//this.getRandomInt(1,8)
      });
      connectionCount[i] = 0;

      // create edges in a scale-free-network way
      if (i == 1) {
        let from = 1;
        let to = 0;
        edges.push({
          id: 'tmp_' + Math.random(),
          from: from,
          to: to,
          dBandwidth: this.getRandomInt(1,10)
        });
        connectionCount[from]++;
        connectionCount[to]++;
      }
      else if (i > 1) {
        let conn = edges.length * 2;
        let rand = Math.floor(Math.random() * conn);
        let cum = 0;
        let j = 0;
        while (j < connectionCount.length && cum < rand) {
          cum += connectionCount[j];
          j++;
        }


        let from = i;
        let to = j;
        edges.push({
          id: 'tmp_' + Math.random(),
          from: from,
          to: to,
          dBandwidth: this.getRandomInt(1,10)
        });
        connectionCount[from]++;
        connectionCount[to]++;
      }
    }

    return {nodes:nodes, edges:edges};
  }

  prepareVNRequest(virtualNodes, virtualLinks, isNewTest) {
    // virtual nodes info
    let idVirtualNodes = [];
    let resourceTypes = [];
    let locations = [];
    let upperBoundCosts = [];
    let computing_demands = [];

    // virtual links info
    let idLinks = [];
    let from = [];
    let to = [];
    let dBandwidth = [];

    virtualNodes.forEach((node) => {
      idVirtualNodes.push(node._id);
      resourceTypes.push(node.type);
      locations.push(node.location);
      computing_demands.push(node.computing_demand);
      upperBoundCosts.push(node.upperBoundCost);
    });
    virtualLinks.forEach(link => {
      idLinks.push(link.id);
      from.push(link.from);
      to.push(link.to);
      dBandwidth.push(link.dBandwidth);
    });
    return {idVirtualNodes:idVirtualNodes, resourceTypes: resourceTypes, locations: locations, upperBoundCosts: upperBoundCosts,
      computing_demands: computing_demands, idLinks: idLinks, from: from, to: to, dBandwidth: dBandwidth, lifetime: this.lifetime, InPs: this.InPs,
      arrivalRate:this.arrivalRate, numOfRequest: this.numOfRequest, isNewTest: isNewTest };
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(6); //The maximum is exclusive and the minimum is inclusive
  }


}
