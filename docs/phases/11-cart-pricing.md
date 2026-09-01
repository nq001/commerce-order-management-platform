# Phase 11 — Cart, Pricing & Coupons

## Objective

Implement deterministic cart and pricing behavior.

## End-to-End Work

Implement:

- Cart creation/retrieval
- Add/update/remove item
- Quantity validation
- Current product-price resolution
- Subtotal
- Discount
- Coupon validation
- Final total
- Coupon usage rules
- Ownership enforcement

## Pricing Rules

Define and unit-test:

- Empty cart
- Quantity changes
- Invalid product
- Inactive product
- Expired coupon
- Ineligible coupon
- Minimum order conditions
- Discount calculation
- Rounding
- Maximum discount
- Final total

## Exit Criteria

The same valid inputs produce the same pricing result, and invalid combinations are rejected.

## Evidence

Pricing unit tests + cart integration tests + pricing documentation.
