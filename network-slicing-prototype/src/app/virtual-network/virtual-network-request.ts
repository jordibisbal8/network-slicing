import {Http, Headers} from '@angular/http';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MdDialog} from "@angular/material";
import {VirtualNodeDialogComponent} from "./virtual-node.dialog.component";
import {AuthService} from "../auth/auth.service";

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
  public movedNode;

  /*public isEditEnabled: boolean;

  @Input()
  set editVersionMode(isEditEnabled) {
    this.isEditEnabled = isEditEnabled;
    this.ngOnInit();
  }*/

  constructor(public route: ActivatedRoute,
              public router: Router,
              public http: Http,
              public dialog: MdDialog) {
  }

  ngOnInit() {
    // Static Nodes
    this.nodes = new vis.DataSet([
      {id: 1000, x: -430, y: 303, label: 'A', group: 'A', fixed: true},
      {id: 1001, x: -366, y: 301, label: 'B', group: 'B', fixed: true},
      {id: 1002, x: -306, y: 302, label: 'C', group: 'C', fixed: true},
      {id: 4, label: 'Virtual network request', font: '30px arial black',  shape: 'text', x:-34, y:-303},

      /*
      {id: 0, x: -843, y: 67, color: 'rgba(0,0,0,0)', fixed: true},
      {id: 1, x: 841, y: 67, color: 'rgba(0,0,0,0)', fixed: true},
      {id: 2, x: -45, y: -485, color: 'rgba(0,0,0,0)', fixed: true},
      {id: 3, x: -45, y: 669, color: 'rgba(0,0,0,0)', fixed: true},
      {id: 5, label: 'CHALLENGERS', font: '35px arial black', shape: 'text', size: 30, x: -631, y: -398, fixed: true},
      {id: 6, label: 'VISIONAIRES', font: '35px arial black', shape: 'text', size: 30, x: 168, y: 581, fixed: true},
      {id: 7, label: 'NICHE PLAYERS', font: '35px arial black', shape: 'text', size: 30, x: -692, y: 571, fixed: true}*/
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
          shape: 'triangle',
          color: '#FF9900', // orange
          size: 20,

        },
        B: {
          shape: 'dot',
          color: "#2B7CE9", // blue
          size: 20,

        },
        C: {
          shape: 'square',
          color: "#C5000B", // red
          size: 20,
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
            nodeData.resource = result.resource;
            if (nodeData.resource === 'a'){
              nodeData.group = 'A';
            }
            if (nodeData.resource === 'b'){
              nodeData.color = 'blue';
              nodeData.group = 'B';
            }
            if (nodeData.resource === 'c'){
              nodeData.color = 'orange';
              nodeData.group = 'C';
            }
            nodeData.comment = result.comment;
            nodeData.location = result.location;
            nodeData.label = 'TEST';
            // Todo Label, virtualNodesManager?
            callback(nodeData);
          })
        },
        editNode: (nodeData, callback) => {
          //TODO OPEN SIDENAV in parent virtual-network.component
          if (nodeData.id === 9){
            let result = prompt('Name', 'Name');
            if (result) {
              nodeData.label = result;
              callback(nodeData);
              return
            }
            callback();
            return
          }
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
          let result = prompt('Bandwidth', 'MB');
          if (result) {
            edgeData.label = result;
            callback(edgeData);
          }
          else
            callback();
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
}
