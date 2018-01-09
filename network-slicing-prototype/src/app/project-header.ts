import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: 'project-header',
  templateUrl: './project-header.html'
})
export class ProjectHeaderComponent{

  @Input() color;
  @Input() title;
  @Input() icon;

  constructor(){
  }

}
