import {AbstractControl} from '@angular/forms';

export class AddressValidation {

  static isAddressValid(AC: AbstractControl) {
    let address = AC.get('address').value; // to get value in input tag
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // check if it has the basic requirements of an address
      AC.get('address').setErrors( {isAddressValid: true} )
      return null;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      // If it's all small caps or all all caps, return "true
    }
  }
}
