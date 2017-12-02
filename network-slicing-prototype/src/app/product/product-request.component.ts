import {Http, Headers} from '@angular/http';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MdDialog} from "@angular/material";

declare let vis: any; // load library also in index.html

@Component({
  // HTML tag for specifying this component
  selector: 'product-request',
  // Let Angular 2 know about `Http` and `TodoService`
  templateUrl: './product-request.component.html',
})

export class ProductRequestComponent implements OnInit {

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
      {id: 0, x: -843, y: 67, color: 'rgba(0,0,0,0)', fixed: true},
      {id: 1, x: 841, y: 67, color: 'rgba(0,0,0,0)', fixed: true},
      {id: 2, x: -45, y: -485, color: 'rgba(0,0,0,0)', fixed: true},
      {id: 3, x: -45, y: 669, color: 'rgba(0,0,0,0)', fixed: true},
      {id: 4, label: 'LEADERS', font: '35px arial black',  shape: 'text', x: 129, y: -400},
      {id: 5, label: 'CHALLENGERS', font: '35px arial black', shape: 'text', size: 30, x: -631, y: -398, fixed: true},
      {id: 6, label: 'VISIONAIRES', font: '35px arial black', shape: 'text', size: 30, x: 168, y: 581, fixed: true},
      {id: 7, label: 'NICHE PLAYERS', font: '35px arial black', shape: 'text', size: 30, x: -692, y: 571, fixed: true}
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
          size: 16,
        },
        shapeProperties: {borderRadius: 0},
        widthConstraint: {maximum: 200}, color: {
          border: 'rgba(52,52,52,1)', background: 'rgba(186,186,186,1)',
          highlight: {border: 'rgba(52,52,52,1)', background: 'rgba(186,186,186,1)'},
          hover: {border: 'rgba(52,52,52,1)', background: 'rgba(186,186,186,1)'}
        },
      },
      interaction: {hover: true},
      manipulation: {
        enabled: true,
        addNode: (nodeData, callback) => {
          //TODO ADD NODE DIALOG
          callback(nodeData);
        },
        editNode: (nodeData, callback) => {
          //TODO OPEN SIDENAV in parent product.component
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
    this.network.once('stabilized', () => {
      let scaleOption = { scale : 0.57};
      this.network.moveTo(scaleOption);
    });
    // Update node's position when using dragEnd in the DataView
    this.network.on('dragEnd', (event) => {
      /*if (!this.isEditEnabled)
        return;*/
      //console.log('-- self.network.body.data.nodes._data', this.network.body.data.nodes._data);
      if (event.nodes.length === 0) {
        return;
      }
      // For the case that is a fixed node. Cant move a fixed node.
      if (typeof event.nodes[0] === 'number') {
        return;
      }
      this.network.storePositions();
      let nodes = this.network.body.data.nodes._data;
      for (let key in nodes) {
        if (nodes[key].id === event.nodes[0]) {
          this.movedNode = nodes[key];
        }
      }
    });
  }
}
