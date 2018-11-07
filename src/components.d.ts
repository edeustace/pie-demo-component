/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';




export namespace Components {

  interface PieDemo {
    /**
    * Include an editor in the view
    */
    'editor': boolean;
    /**
    * The model for the pie.
    */
    'model': string;
    /**
    * The PIE npm package to demo. e.g. `@pie-elements/multiple-choice`
    */
    'pie': string;
    /**
    * Include control panel for adjusting player settings.
    */
    'playerControls': boolean;
    /**
    * Include an item preview in the view
    */
    'preview': boolean;
  }
  interface PieDemoAttributes extends StencilHTMLAttributes {
    /**
    * Include an editor in the view
    */
    'editor'?: boolean;
    /**
    * The model for the pie.
    */
    'model'?: string;
    /**
    * The PIE npm package to demo. e.g. `@pie-elements/multiple-choice`
    */
    'pie'?: string;
    /**
    * Include control panel for adjusting player settings.
    */
    'playerControls'?: boolean;
    /**
    * Include an item preview in the view
    */
    'preview'?: boolean;
  }
}

declare global {
  interface StencilElementInterfaces {
    'PieDemo': Components.PieDemo;
  }

  interface StencilIntrinsicElements {
    'pie-demo': Components.PieDemoAttributes;
  }


  interface HTMLPieDemoElement extends Components.PieDemo, HTMLStencilElement {}
  var HTMLPieDemoElement: {
    prototype: HTMLPieDemoElement;
    new (): HTMLPieDemoElement;
  };

  interface HTMLElementTagNameMap {
    'pie-demo': HTMLPieDemoElement
  }

  interface ElementTagNameMap {
    'pie-demo': HTMLPieDemoElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}
