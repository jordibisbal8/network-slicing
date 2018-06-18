import {Component, OnInit, ViewChild} from "@angular/core";
import {MdDialog, MdSnackBar} from "@angular/material";
import {PeeringNodeDialogComponent} from "./dialogs/peering-node.dialog.component";
import {SubstrateNetworkService} from "../services/substrate-network.service";
import {PeeringNode} from "../model/PeeringNode";
import {Link} from "../model/Link";

declare let vis: any; // load library also in index.html

@Component({
  selector: 'substrate-network',
  templateUrl: './substrate-network.component.html'
})
export class SubstrateNetworkComponent implements OnInit {

  @ViewChild('mynetwork') public container;

  public network;
  public nodes;
  public edges;
  public isLoading: boolean;

  // substrate node info
  idNodes = [];
  resourceTypes = [];
  locations = [];
  x = [];
  y = [];

  // substrate links info
  idLinks = [];
  from = [];
  to = [];
  capacities = [];


  constructor(
    public dialog: MdDialog,
    public substrateNetworkService: SubstrateNetworkService,
    public snackBar: MdSnackBar
  ){
  }

  ngOnInit() {
    this.nodes = new vis.DataSet([]);
    this.edges = new vis.DataSet([]);
    this.substrateNetworkService.getPeeringNodes().subscribe((peeringNodesAndLinks) => {
      peeringNodesAndLinks.peeringNodes.forEach((peeringNode: PeeringNode) => {
        peeringNode.label = peeringNode.location;
        peeringNode.title = '';
        console.log("-- peeringNode.resources", peeringNode.resources);
        console.log("-- peeringNodes.resources.length", peeringNode.resources.length);
        peeringNode.resources.forEach(resourceType => {
          peeringNode.title = peeringNode.title.concat(resourceType);
        });
        this.nodes.add(peeringNode);
      });
      peeringNodesAndLinks.peeringLinks.forEach((link: Link) => {
        this.edges.add(link);
      })
    });

    let data = {
      nodes: this.nodes,
      edges: this.edges,
    };

    let options = {
      nodes: {
        physics: false,
        shape: 'dot',
        color: {background:'white',
                border:'black',
                highlight:{background:'#ad1457', border: 'black'},hover:{background:'white',border:'#ad1457'}},
        font: {
          size: 20,
        },
        group: 0,
        size: 27,
        shapeProperties: {borderRadius: 0},
      },
      edges: {
        font: {align: 'top'},
        smooth: false,
        color: {
          color: 'black',
          highlight: '#ad1457' ,hover: '#ad1457'},
      },
      interaction: {hover: true},
      manipulation: {
        enabled: true,
        addNode: (nodeData, callback) => {
          let dialogRef = this.dialog.open(PeeringNodeDialogComponent, {
            width: '1000px'
          });
          dialogRef.componentInstance.addMode = true;
          dialogRef.afterClosed().subscribe(peeringNode => {
            if (peeringNode) {
              this.isLoading = true;
              nodeData.id = 'tmp_' + Math.random();
              nodeData.resources = peeringNode.resources;
              nodeData.location = peeringNode.location;
              nodeData.label = peeringNode.location;
              nodeData.title = '';
              peeringNode.resources.forEach(resourceType => {
                nodeData.title = nodeData.title.concat(resourceType);
              });
              this.isLoading = false;
              callback(nodeData);
            }
            else callback();
          })
        },
        deleteNode: (nodeData, callback) => {
          if (confirm('Are you sure you want to delete the clicked substrate node?'))
            callback(nodeData);
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

          let capacity = prompt('Link capacity', 'MB');
          if (capacity) {
            this.isLoading = true;
            edgeData.label = capacity;
            edgeData.capacity = capacity;
            edgeData.id = 'tmp_' + Math.random();
            this.isLoading = false;
            return callback(edgeData);
          }
          else
            callback();
        },
        editEdge: (edgeData, callback) => {
          let result = prompt('Link capacity', edgeData.label);
          if (result){
            edgeData.label = result;
            return callback(edgeData)
          }
          else
            callback();
        },
        deleteEdge: (edgeData, callback) => {
          let result = confirm('Are you sure you want to delete the clicked link?');
          if (result) {
            callback(edgeData);
          }
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
            let dialogRef = this.dialog.open(PeeringNodeDialogComponent, {
              width: '1000px'
            });
            dialogRef.componentInstance.inputNode = node;
          }
        });
      }
    });
  }

  isDisabled() {
    return (this.nodes.length === 0 || this.edges.length === 0);
  }

  save() {
    let result = confirm('Are you sure you want to send the created virtual network request?');
    if (result) {
      this.isLoading = true;
      this.network.storePositions();
      this.snackBar.open("The substrate network is being created...", 'X', {
        duration:5000
      });
      let data = this.prepareRequest(this.network.body.data.nodes, this.network.body.data.edges);
      this.substrateNetworkService.savePeeringNodes(data).subscribe(res => {
        this.isLoading = false;
        this.snackBar.open("The substrate network has been successfully created...", 'X', {
          duration:5000
        });
      })
    }

  }

  prepareRequest(nodes, links) {

    for (let i in nodes._data) {
      this.idNodes.push(nodes._data[i].id);
      this.resourceTypes.push([nodes._data[i].resources]);
      this.locations.push(nodes._data[i].location);
      this.x.push(nodes._data[i].x);
      this.y.push(nodes._data[i].y);
    }

    for (let i in links._data) {
      this.idLinks.push(links._data[i].id);
      this.from.push(links._data[i].from);
      this.to.push(links._data[i].to);
      this.capacities.push(links._data[i].label);
    }
    return {idNodes:this.idNodes, resourceTypes: this.resourceTypes, locations: this.locations, x: this.x, y: this.y,
      idLinks: this.idLinks, from: this.from, to: this.to, capacities: this.capacities};
  }

  test1() {
      let data = {
        capacities
          :
          ["11", "22", "33"],
        from
          :
          ["tmp_0.991438133524088", "tmp_0.991438133524088", "tmp_0.6324132511452103"],
        idLinks
          :
          ["tmp_0.308501753945966", "tmp_0.15933620091497325", "tmp_0.05964031547760884"],
        idNodes
          :
          ["tmp_0.991438133524088", "tmp_0.6324132511452103", "tmp_0.73339141577321"],
        locations
          :
          ["DE", "CH", "ES"],
        resourceTypes
          :
          [[["A"]], [["B"]], [["C", "D", "F"]]],
        to
          :
          ["tmp_0.73339141577321", "tmp_0.6324132511452103", "tmp_0.73339141577321"],
        x
          :
          [-184, -20, 157],
        y
          :
          [-37, -160, -11]
      };

    this.substrateNetworkService.savePeeringNodes(data).subscribe(res => {
      this.isLoading = false;
      this.snackBar.open("The substrate network has been successfully created...", 'X', {
        duration:5000
      });
    })

  }

  test2() {
    let data = {
      capacities
        :
        ["10"],
      from
        :
        ["tmp_0.991438133524081"],
      idLinks
        :
        ["tmp_0.308501753945966",],
      idNodes
        :
        ["tmp_0.991438133524081", "tmp_0.6324132511452101"],
      locations
        :
        ["DE", "ES"],
      resourceTypes
        :
        [[["A", "B"]], [["F"]]],
      to
        :
        ["tmp_0.6324132511452101"],
      x
        :
        [-298, -184],
      y
        :
        [-39, -37]
    };

    this.substrateNetworkService.savePeeringNodes(data).subscribe(res => {
      this.isLoading = false;
      this.snackBar.open("The substrate network has been successfully created...", 'X', {
        duration:5000
      });
    })
  }

  test3() {
    let data = {
      capacities
        :
        ["30"],
      from
        :
        ["tmp_0.991438133524082"],
      idLinks
        :
        ["tmp_0.308501753945969",],
      idNodes
        :
        ["tmp_0.991438133524082", "tmp_0.6324132511452102"],
      locations
        :
        ["ES", "ES"],
      resourceTypes
        :
        [[["D", "F"]], [["A", "B"]]],
      to
        :
        ["tmp_0.6324132511452102"],
      x
        :
        [-298, -184],
      y
        :
        [-39, -37]
    };

    this.substrateNetworkService.savePeeringNodes(data).subscribe(res => {
      this.isLoading = false;
      this.snackBar.open("The substrate network has been successfully created...", 'X', {
        duration:5000
      });
    })
  }

  test4 () {
    let data = {
      capacities
        :
        ["11", "22", "33"],
      from
        :
        ["tmp_0.991438133524086", "tmp_0.991438133524086", "tmp_0.6324132511452106"],
      idLinks
        :
        ["tmp_0.308501753945966", "tmp_0.15933620091497325", "tmp_0.05964031547760884"],
      idNodes
        :
        ["tmp_0.991438133524086", "tmp_0.6324132511452106", "tmp_0.73339141577326"],
      locations
        :
        ["DE", "IT", "ES"],
      resourceTypes
        :
        [[["A"]], [["C", "D"]], [["E", "F"]]],
      to
        :
        ["tmp_0.73339141577326", "tmp_0.6324132511452106", "tmp_0.73339141577326"],
      x
        :
        [-184, -20, 157],
      y
        :
        [-37, -160, -11]
    };

    this.substrateNetworkService.savePeeringNodes(data).subscribe(res => {
      this.isLoading = false;
      this.snackBar.open("The substrate network has been successfully created...", 'X', {
        duration:5000
      });
    })
}


}
