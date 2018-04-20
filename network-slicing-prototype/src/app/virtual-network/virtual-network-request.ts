import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MdDialog, MdSnackBar} from "@angular/material";
import {VirtualNodeDialogComponent} from "./dialogs/virtual-node.dialog.component";
import {VirtualNetworkService} from "../services/virtual-network.service";

declare let vis: any; // load library also in index.html

@Component({
  // HTML tag for specifying this component
  selector: 'virtual-network-request',
  // Let Angular 2 know about `Http` and `TodoService`
  templateUrl: './virtual-network-request.html',
})

export class VirtualNetworkRequestComponent implements OnInit {
  @ViewChild('mynetwork') public container;

  public network;
  public nodes;
  public edges;
  public isLoading: boolean;
  public auctionAddr;
  public bidders: any[];

  // virtual nodes info
  idVirtualNodes = [];
  resourceTypes = [];
  locations = [];
  x = [];
  y = [];
  upperBoundCosts = [];

  // virtual links info
  idLinks = [];
  from = [];
  to = [];
  dBandwidth = [];

  inputVnUpperBoundCost: number;
  inputSumOfUpperBoundCosts: number;

  public settings = {
    timePicker: true,
    format: 'dd-MMM-yyyy hh:mm a',
  };

  public today: Date = new Date();
  public _inputEndTime: Date = new Date();
  public inputEndTime: number;

  constructor(public dialog: MdDialog,
              public virtualNetworkService: VirtualNetworkService,
              public snackBar: MdSnackBar) {
  }

  ngOnInit() {
    this.nodes = new vis.DataSet([]);
    this.edges = new vis.DataSet([]);

    let data = {
      nodes: this.nodes,
      edges: this.edges,
    };

    let options = {
      nodes: {
        physics: false,
        shape: 'box',
        widthConstraint:
          { minimum: 40},
        heightConstraint:
          { minimum: 40},
        color: {
          background: 'white',
          border: 'black',
          highlight: {background: '#009688', border: 'black'}, hover: {background: 'white', border: '#009688'}
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
          highlight: '#009688', hover: '#009688'
        },
        smooth: false,
      },
      interaction: {hover: true},
      manipulation: {
        enabled: true,
        addNode: (nodeData, callback) => {
          let dialogRef = this.dialog.open(VirtualNodeDialogComponent, {
            width: '1000px'
          });
          if (!this.inputVnUpperBoundCost && !!this.inputSumOfUpperBoundCosts)
            dialogRef.componentInstance.isUpperBoundMandatory = !!this.inputSumOfUpperBoundCosts;
          dialogRef.componentInstance.addMode = true;
          dialogRef.afterClosed().subscribe(virtualNode => {
            if (virtualNode) {
              let addedNode = this.addNode(virtualNode, nodeData);
              callback(addedNode);
            }
            else
              return callback();
          });
        },

        deleteNode: (nodeData, callback) => {
          let result = confirm('Are you sure you want to delete the clicked element?');
          if (result) {
            this.nodes.forEach(node => {
              if (node.id === nodeData.nodes[0])
                if (this.inputSumOfUpperBoundCosts && node.upperBoundCost)
                  this.inputSumOfUpperBoundCosts -= node.upperBoundCost;
            });
            callback(nodeData);
          }
          else {
            callback();
          }
        },

        addEdge: (edgeData, callback) => {
          let exists = false;
          this.edges.forEach(edge => {
            if (edge.from === edgeData.from && edge.to === edgeData.to)
              exists = true;
            if (edge.from === edgeData.to && edge.to === edgeData.from)
              exists = true;
          });

          if (exists) {
            window.alert('This edge already exists');
            return callback();

          }

          let dBandwidth = prompt('Bandwidth demand', 'MB');
          if (dBandwidth) {
            edgeData.label = dBandwidth;
            edgeData.dBandwidth = dBandwidth;
            edgeData.id = 'tmp_' + Math.random();
            callback(edgeData);
          }
          else
            callback();
        },
        editEdge: (edgeData, callback) => {
          let result = prompt('Bandwidth demand', edgeData.label);
          if (result) {
            edgeData.label = result;
            return callback(edgeData)
          }
          else
            callback();
        },
        deleteEdge: (edgeData, callback) => {
          if (confirm('Are you sure you want to delete the clicked link?'))
            callback(edgeData);
          else
            callback();
        }
      }
    };
    // initialize your network!
    this.network = new vis.Network(this.container.nativeElement, data, options);
    this.network.on("doubleClick", params => {
      if (params.nodes[0]) {
        this.nodes.forEach(node => {
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

  addNode(virtualNode, nodeData){
    nodeData.id = 'tmp_' + Math.random();
    if (this.inputSumOfUpperBoundCosts)
      this.inputSumOfUpperBoundCosts += virtualNode.upperBoundCost;
    else
      this.inputSumOfUpperBoundCosts = virtualNode.upperBoundCost;
    nodeData.label = virtualNode.type;
    nodeData.type = virtualNode.type;
    nodeData.location = virtualNode.location;
    nodeData.title = virtualNode.location;
    nodeData.upperBoundCost = virtualNode.upperBoundCost;
    return nodeData;
  }

  send() {
    if (!this.inputVnUpperBoundCost && !this.inputSumOfUpperBoundCosts)
      return window.alert('An upper bound cost for the whole virtual network or for each virtual node must be defined.');
    let result = confirm('Are you sure you want to send the created virtual network request?');
    if (result) {
      this.isLoading = true;
      this.network.storePositions();
      this.snackBar.open("The auction with the matching InPs is being created...", 'X', {
        duration:5000
      });
      let data = this.prepareVNRequest(this.network.body.data.nodes, this.network.body.data.edges, this.inputVnUpperBoundCost);
      this.virtualNetworkService.sendVirtualNetwork(data)
        .subscribe((res) => {
        this.auctionAddr = res.auctionAddr;
        this.snackBar.open("Auction successfully created with address" + this.auctionAddr, 'X', {
          duration:5000
        });
        this.isLoading = false;
      })
    }
  }

  isDisabled() {
    return (this.nodes.length === 0 || !this.inputEndTime || this.edges.length === 0);
  }

  prepareVNRequest(virtualNodes, virtualLinks, VnUpperBoundCost) {

    for (let i in virtualNodes._data) {
      this.idVirtualNodes.push(virtualNodes._data[i].id);
      this.resourceTypes.push(virtualNodes._data[i].type);
      this.locations.push(virtualNodes._data[i].location);
      this.x.push(parseInt(virtualNodes._data[i].x));
      this.y.push(parseInt(virtualNodes._data[i].y));
      // If upper bound cost for the whole network defined, the one for each virtual node will be treated as:
      if (VnUpperBoundCost) {
        this.upperBoundCosts.push(VnUpperBoundCost / virtualNodes.length);
      }
      else
        this.upperBoundCosts.push(virtualNodes._data[i].upperBoundCost);
    }

    for (let i in virtualLinks._data) {
      this.idLinks.push(virtualLinks._data[i].id);
      this.from.push(virtualLinks._data[i].from);
      this.to.push(virtualLinks._data[i].to);
      this.dBandwidth.push(virtualLinks._data[i].label);
    }
    return {idVirtualNodes:this.idVirtualNodes, resourceTypes: this.resourceTypes, locations: this.locations, upperBoundCosts: this.upperBoundCosts,
      x: this.x, y: this.y, idLinks: this.idLinks, from: this.from, to: this.to, dBandwidth: this.dBandwidth, endTime: this.inputEndTime};
  }

  endTimeChanged() {
    if (new Date(this._inputEndTime) < this.today) {
      return window.alert("Past dates are invalid")
    }
    this.inputEndTime = new Date(this._inputEndTime).getTime() / 1000; // to convert it to number
  }

  test1() {
    let data = {
      dBandwidth
        :
        ["55"],
      endTime
        :
        this.inputEndTime,
      from
        :
        ["tmp_0.9685257894965105"],
      idLinks
        :
        ["tmp_0.2133892772549537"],
      idVirtualNodes
        :
        ["tmp_0.9685257894965105", "tmp_0.16357679928240887"],
      locations
        :
        ["DE", "ES"],
      resourceTypes
        :
        ["A", "F"],
      to
        :
        ["tmp_0.16357679928240887"],
      upperBoundCosts
        :
        [20, 50],
      x
        :
        [-320, -93],
      y
        :
        [-46, -43]
    };
    this.virtualNetworkService.sendVirtualNetwork(data)
      .subscribe((res) => {
        this.auctionAddr = res.auctionAddr;
        this.snackBar.open("Auction successfully created with address" + this.auctionAddr, 'X', {
          duration:5000
        });
        this.isLoading = false;
      })
  }
}
