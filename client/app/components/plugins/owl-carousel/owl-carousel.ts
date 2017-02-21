import { Component, Input, ElementRef, HostBinding } from '@angular/core';
import $ from 'jquery';
import 'owl-carousel';

@Component({
  selector: 'owl-carousel',
  template: `<ng-content></ng-content>`
})
export class OwlCarousel {
  @HostBinding('class') defaultClass = 'owl-carousel';
  @Input() options: object;
  
  $owlElement: any;

  defaultOptions: any = {};

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    // use default - empty
    // for (var key in this.options) {
    //   this.defaultOptions[key] = this.options[key];
    // }
    this.$owlElement = $(this.el.nativeElement).owlCarousel(this.defaultOptions);
  }

  ngOnDestroy() {
    this.$owlElement.data('owlCarousel').destroy();
    this.$owlElement = null;
  }
}