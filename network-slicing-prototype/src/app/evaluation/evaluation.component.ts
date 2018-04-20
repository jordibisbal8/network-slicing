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

  // TODO FROM 5-10 InPs
  InPs = ['0x124547c8ca778d9630ba75d9caff8fe0fe5f2d75',
    '0x695685829237d41b912a947cf4fe820649ee4db7',
    '0xa5aff7d0ba9c17ae3add40b47ab87a5982c96f95',
    '0xb00197cd3cde1f7b89f246bf925ccc4df116ee37'
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
  private locations_with_broadcast = new Static_Values().locations_with_broadcast
  private types = new Static_Values().types_ev;



  constructor(public http: HttpClient,
              public dialog: MdDialog,
              public snackBar: MdSnackBar,
              public evaluationService: EvaluationService){
  }

  ngOnInit(){
    this.getInPs();
    this.getGraphML('condensed_west_europe_new.graphml');
    //let uniformDistribution = this.getUniformDistribution(1,50);
  }

  getInPs() {
    // TODO LENGTH this.getRandomInt(5,10);
    for (let i = 0; i < 4; i++) {
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
        console.log("-- this.peeringNodes", this.peeringNodes);
        console.log("-- this.peeringLinks", this.peeringLinks);
        console.log("-- intraLinks", this.intraLinks);
      });
    });
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(6); //The maximum is exclusive and the minimum is inclusive
  }

  createSubstrateNode(node) {
    let attributes = node._attributes;
    for (let i = 0; i < this.selectedInPs.length; i++) {
      let resources = [];
      for (let j = 0; j < this.getRandomInt(1,6); j++) {
        let type = this.types[Math.floor(Math.random() * this.types.length)];
        // TO check it is not repeated
        if (resources.map(x => x.type).indexOf(type) === -1) {
          let unitary_cost = this.checkResourceCost(type);
          let capacity = this.getRandomInt(200, 300);
          resources.push({
            type: type,
            unitary_cost: unitary_cost,
            capacity: capacity,
          });
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

  // Prices from Amazon EC2 pricing
  checkResourceCost(type) {
    if (type === 'A') {
      return this.getRandomFloat(0.006, 0.12) * 1000; // We multiply per 1000 because the blockchain does not accept floats
    }
    if (type === 'B') {
      return this.getRandomFloat(0.096, 0.119) * 1000;
    }
    if (type === 'C') {
      return this.getRandomFloat(0.148, 0.16) * 1000;
    }
    if (type === 'D') {
      return this.getRandomFloat(0.972, 1.323) * 1000;
    }
    if (type === 'E') {
      return this.getRandomFloat(0.172, 0.794) * 1000;
    }
  }


  getScaleFreeNetwork(nodeCount) {
    let nodes = [];
    let edges = [];
    let connectionCount = [];

    // randomly create some nodes and edges
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
        upperBoundCost: this.getRandomInt(5,20) * 1000,
        computing_demand: this.getRandomInt(1,8)
      });
      connectionCount[i] = 0;

      // create edges in a scale-free-network way
      if (i == 1) {
        let from = i;
        let to = 0;
        edges.push({
          from: from,
          to: to
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

  getUniformDistribution(min,max) {
    let uniformDistribution = {};
    for (let i = 0; i < 100; i++)
    {
      let a = this.getRandomInt(min,max);

      if (typeof uniformDistribution[a] === 'undefined') // first time initialize
        uniformDistribution[a] = 1;
      else
        uniformDistribution[a] ++;
    }
    return uniformDistribution;
  }

  enterInPsPeeringNodes() {
    let data = {peeringNodes: this.peeringNodes, peeringLinks: this.peeringLinks};
    this.evaluationService.savePeeringNodes(data).subscribe(res => {
      this.snackBar.open("Substrate networks added into the blockchain", 'X', {
        duration:5000
      });
    })
  }
  partitioning() {
    // TODO FOR WITH ARRIVAL RATE
    let data = this.getScaleFreeNetwork(this.getRandomInt(2,10));
    let data2 = this.prepareVNRequest(data.nodes, data.edges);
    this.evaluationService.partitioning(data2).subscribe(res => {
      this.snackBar.open("Virtual network successfully embedded and expired", 'X', {
        duration:5000
      });    }, err => {
      window.alert(err._body);
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

  prepareVNRequest(virtualNodes, virtualLinks) {
    let lifetime = this.getRandomInt(500,5000); // OR FIXED?
    // virtual nodes info
    let idVirtualNodes = [];
    let resourceTypes = [];
    let locations = [];
    let x = [];
    let y = [];
    let upperBoundCosts = [];
    let computing_demands = [];

    // virtual links info
    let idLinks = [];
    let from = [];
    let to = [];
    let dBandwidth = [];

    virtualNodes.forEach((node,i) => {
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
      computing_demands: computing_demands, idLinks: idLinks, from: from, to: to, dBandwidth: dBandwidth, lifetime: lifetime, InPs: this.InPs};
  }

}
