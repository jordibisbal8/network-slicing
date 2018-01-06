import {Http, Headers} from '@angular/http';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MdDialog} from "@angular/material";
import {VirtualNodeDialogComponent} from "./dialogs/virtual-node.dialog.component";
import {AuthService} from "../auth/auth.service";
import {VnManager} from "../common/vn.manager";
import {VnService} from "../services/vn-service";

declare let vis: any; // load library also in index.html

@Component({
  // HTML tag for specifying this component
  selector: 'virtual-network-request',
  // Let Angular 2 know about `Http` and `TodoService`
  templateUrl: './virtual-network-request.html',
})

export class VirtualNetworkRequestComponent implements OnInit {

  public network;
  public nodes;
  public edges;
  public movedNode;
  public vnManager: VnManager = new VnManager();
  public secondStep: boolean = false;

  public settings = {
    timePicker: true,
    format: 'dd-MMM-yyyy hh:mm a',
  };
  public inputRevealTime: Date = new Date();
  public inputCommitTime: Date = new Date();

  @ViewChild('mynetwork') public container;

  public inputPrice: number;
  public auctionType: string;
  public auctionsList: string [];

  public inPsList: string [];

  /*public isEditEnabled: boolean;

  @Input()
  set editVersionMode(isEditEnabled) {
    this.isEditEnabled = isEditEnabled;
    this.ngOnInit();
  }*/

  constructor(public route: ActivatedRoute,
              public router: Router,
              public http: Http,
              public vnService: VnService,
              public dialog: MdDialog) {
  }

  ngOnInit() {
    // TODO use them for the checkboxes.
    this.vnService.getInPs().subscribe((inPs: string []) => {
      this.inPsList = inPs;
    });
    // Static Nodes
    this.nodes = new vis.DataSet([
      /*{id: 1000, x: -430, y: 303, label: 'A', group: 'A', fixed: true},
      {id: 1001, x: -366, y: 301, label: 'B', group: 'B', fixed: true},
      {id: 1002, x: -306, y: 302, label: 'C', group: 'C', fixed: true},
      {id: 4, label: 'Legend', font: '30px arial black',  shape: 'text', x:-369, y:248, fixed: true},
      {id: 5, label: 'Virtual network request', font: '30px arial black',  shape: 'text', x:-34, y:-303, fixed: true},*/
    ]);
    this.edges = new vis.DataSet([
      {from: 0, to: 1, width: 3, color: '#989898', arrows: 'to', arrowStrikethrough: false},
      {from: 3, to: 2, width: 3, color: '#989898', arrows: 'to', arrowStrikethrough: false}
    ]);
    // provide the data in the vis format
    let data = {
      nodes: this.nodes,
      edges: this.edges,
    };
    let options = {
      nodes: {
        physics: false,
        font: {
          size: 20,
        },
        size:40,
        shapeProperties: {borderRadius: 0},
        /*widthConstraint: {maximum: 200}, color: {
          border: 'rgba(52,52,52,1)', background: 'rgba(186,186,186,1)',
          highlight: {border: 'rgba(52,52,52,1)', background: 'rgba(186,186,186,1)'},
          hover: {border: 'rgba(52,52,52,1)', background: 'rgba(186,186,186,1)'}
        },*/
      },
      interaction: {hover: true},
      groups: {
        A: {
          shape: 'image',
          image: "../../assets/img/laptop-icon.png",
          size: 30,

        },
        B: {
          shape: 'image',
          image: "../../assets/img/db_icon.png",
          //color: "#2B7CE9", // blue
          size: 30,

        },
        C: {
          shape: 'image',
          image: "../../assets/img/cloud_icon.png",
          //color: "#C5000B", // red
          size: 25,
        },
        D: {
          shape: 'dot',
          color: "#5A1E5C" // purple
        },
        E: {
          shape: 'square',
          color: "#109618" // green
        }
      },
      manipulation: {
        enabled: true,
        addNode: (nodeData, callback) => {
          let dialogRef = this.dialog.open(VirtualNodeDialogComponent, {
            width: '1000px'
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              nodeData.id = 'tmp_' + Math.random();
              let addedNode = this.fillNodeData(result,nodeData,'add');
              callback(addedNode);
            }
            else callback();
          })
        },
        editNode: (nodeData, callback) => {
          if (nodeData.id.indexOf("tmp") >= 0) {
            let dialogRef = this.dialog.open(VirtualNodeDialogComponent, {
              width: '1000px'
            });
            dialogRef.componentInstance.editMode = true;
            dialogRef.componentInstance.inputNode = nodeData;
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                console.log("-- result", result);
                let editedNode = this.fillNodeData(result,nodeData,'edit');
                callback(editedNode);
              }
              else callback();
            })
          }
          else callback();
        },
        deleteNode: (nodeData, callback) => {
          // First we check if a fixed node wants to be deleted.
          if (typeof (nodeData.nodes[0]) === 'number') {
            window.alert('A fixed node cannot be deleted');
            callback();
            return;
          }
          // We check if a bm wants to be deleted.
          if (nodeData.nodes[0].indexOf('bm') > -1) {
            window.alert('A Business Model cannot be deleted from here');
            callback();
            return;
          }
          let result = confirm('Are you sure you want to delete the clicked element?');
          if (result) {
            callback(nodeData);
          }
          else {
            callback();
          }
        },
        addEdge: (edgeData, callback) => {
          /*let result = prompt('Bandwidth', 'MB');
          if (result) {
            edgeData.label = result;
            callback(edgeData);
          }
          else
            callback();*/
          callback(edgeData);
        },
        editEdge: (edgeData,callback) => {
          // TODO editWithoutDrag
          callback(edgeData);
        },
        deleteEdge: (edgeData, callback) => {
          callback(edgeData);
        }
      }
    };
    // initialize your network!
    this.network = new vis.Network(this.container.nativeElement, data, options);

    // To stabilize the zoom view
    /*this.network.once('stabilized', () => {
      let scaleOption = { scale : 0.5};
      this.network.moveTo(scaleOption);
    });*/
    // Update node's position when using dragEnd in the DataView
    this.network.on('dragEnd', (event) => {
      /*if (!this.isEditEnabled)
        return;*/
      if (event.nodes.length === 0) {
        return;
      }
      // For the case that is a fixed node. Cant move a fixed node.
      /*if (typeof event.nodes[0] === 'number') {
        return;
      }*/
      this.network.storePositions();
      console.log('-- self.network.body.data.nodes._data', this.network.body.data.nodes._data);

      let nodes = this.network.body.data.nodes._data;
      for (let key in nodes) {
        if (nodes[key].id === event.nodes[0]) {
          this.movedNode = nodes[key];
        }
      }
    });
  }
  fillNodeData(result,nodeData, mode){
    nodeData.resource = result.resource;
    //nodeData.comment = result.comment;
    nodeData.location = result.location;
    nodeData.label = nodeData.resource;
    nodeData.group = nodeData.resource;
    if (nodeData.resource === 'Computing'){
      nodeData.shape = 'image';
      nodeData.image = "../../assets/img/laptop-icon.png";
      nodeData.size = 30;
      if (mode === 'edit') {
        this.vnManager.aDimensions.forEach((dim,i) => {
          if (dim.id === nodeData.id)
            this.vnManager.aDimensions[i] = nodeData;
        });
      }
      else
        this.vnManager.aDimensions.push(nodeData);
    }
    if (nodeData.resource === 'Storage'){
      nodeData.shape = 'image';
      nodeData.image = "../../assets/img/db_icon.png";
      nodeData.size = 30;
      if (mode === 'edit') {
        this.vnManager.bDimensions.forEach((dim,i) => {
          if (dim.id === nodeData.id)
            this.vnManager.bDimensions[i] = nodeData;
        });
      }
      else
        this.vnManager.bDimensions.push(nodeData);
    }
    if (nodeData.resource === 'Cloud'){
      nodeData.shape = 'image';
      nodeData.image = "../../assets/img/cloud_icon.png";
      nodeData.size = 25;
      if (mode === 'edit') {
        this.vnManager.cDimensions.forEach((dim,i) => {
          if (dim.id === nodeData.id)
            this.vnManager.cDimensions[i] = nodeData;
        });
      }
      else
        this.vnManager.cDimensions.push(nodeData);
    }
    return nodeData;
  }

  toggleSteps() {
    this.secondStep = !this.secondStep;
  }
  send() {
    if (confirm('Are you sure you want to request the specified virtual network?')) {
      this.vnService.beginAuction(this.inputCommitTime, this.inputRevealTime).subscribe(res => {
        console.log("-- res", res);
      })
    }
  }
  getOpenAuctions() {
    this.vnService.getAllOpenAuctions().subscribe(addresses => {
      this.auctionsList = addresses;
    })
  }
  commitBid(index: number) {
    this.vnService.commitBid(index).subscribe(isCommited => {
      console.log("-- isCommited", isCommited);
    })
  }
  revealBid(index: number) {
    this.vnService.revealBid(index).subscribe(isRevealed=> {
      console.log("-- isRevealed", isRevealed);
    })
  }
  commitTimeChanged(event) {
    this.inputCommitTime = new Date(this.inputCommitTime); //this.inputCommitTime.getTime() / 1000
  }
  revealTimeChanged(event) {
    this.inputRevealTime = new Date(this.inputRevealTime); //this.inputRevealTime.getTime() / 1000
  }

}
