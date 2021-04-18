import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { iif } from 'rxjs';
import { combineLatest, concat, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { SessionService } from 'src/app/core/services/session.service';
import { Address } from 'src/app/data/models/address';
import { Order, UpdateOrderParams } from 'src/app/data/models/order';
import { AddressService } from 'src/app/data/services/address.service';
import { CartService } from 'src/app/data/services/cart.service';
import { CustomerAddressService } from 'src/app/data/services/customer-address.service';
import { OrderService } from 'src/app/data/services/order.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.component.html',
  styleUrls: ['./billing-address.component.css']
})
export class BillingAddressComponent implements OnInit {
  showAddresses: boolean = false;
  sameShippingAddressAsBilling: boolean = false;
  selectedCustomerAddressId: string = '';

  constructor(
    private _addresses: AddressService,
    private _snackBar: MatSnackBar,
    private _session: SessionService,
    private _orders: OrderService,
    private _cart: CartService,
    private _router: Router,
    private _customerAddresses: CustomerAddressService) { }

  ngOnInit() {
    this._session.loggedInStatus
      .subscribe(
        status => this.showAddresses = status
      );
  }

  updateBillingAddress(address: Address) {
    if (this.showAddresses && this.selectedCustomerAddressId) {
      this.cloneAddress();
    } else if (address.firstName && address.lastName && address.line1 && address.city && address.zipCode && address.stateCode && address.countryCode && address.phone) {
      this.createAddress(address);
    }
    else {
      this._snackBar.open('Check your address. Some fields are missing.', 'Close');
    }
  }

  setCustomerAddress(customerAddressId: string) {
    this.selectedCustomerAddressId = customerAddressId;
  }

  setSameShippingAddressAsBilling(change: boolean) {
    this.sameShippingAddressAsBilling = change;
  }

  private createAddress(address: Address) {
    this._addresses.createAddress(address)
      .pipe(
        concatMap(
          address => {
            const update = this.updateOrderObservable({
              id: this._cart.orderId,
              billingAddressId: address.id
            }, [UpdateOrderParams.billingAddress]);

            if (this.showAddresses) {
              return combineLatest([update, this._customerAddresses.createCustomerAddress(address.id || '', '')]);
            } else {
              return update;
            }
          }))
      .subscribe(
        () => this.showSuccessSnackBar(),
        err => this.showErrorSnackBar()
      );
  }

  private cloneAddress() {
    this.updateOrderObservable({
      id: this._cart.orderId,
      billingAddressCloneId: this.selectedCustomerAddressId
    }, [UpdateOrderParams.billingAddressClone])
      .subscribe(
        () => this.showSuccessSnackBar(),
        err => this.showErrorSnackBar()
      );
  }

  private updateOrderObservable(order: Order, updateParams: UpdateOrderParams[]): Observable<any> {
    return iif(() => this.sameShippingAddressAsBilling,
      concat([
        this._orders.updateOrder(order, updateParams),
        this._orders.updateOrder(order, [UpdateOrderParams.shippingAddressSameAsBilling])
      ]),
      this._orders.updateOrder(order, updateParams)
    );
  }

  private showErrorSnackBar() {
    this._snackBar.open('There was a problem creating your address.', 'Close', { duration: 8000 });
  }

  private navigateTo(path: string) {
    setTimeout(() => this._router.navigateByUrl(path), 4000);
  }

  private showSuccessSnackBar() {
    this._snackBar.open('Billing address successfully added. Redirecting...', 'Close', { duration: 3000 });
    if (this.sameShippingAddressAsBilling) {
      this.navigateTo('/shipping-methods');
    } else {
      this.navigateTo('/shipping-address');
    }
  }
}