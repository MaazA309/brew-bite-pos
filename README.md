# Brew & Bite Café – POS System

A simple Point of Sale (POS) website for a fictional café, built for a university project.
A cashier can pick food and drinks, build a cart, calculate the bill with tax, complete the order, and print a receipt.

## Features
- **Dashboard:** total sales, completed orders, items sold, and recent orders
- **New Order:** menu with category filters, shopping cart, quantity controls, configurable tax (default 5%), Cash/Card payment
- **Receipt:** order number, date/time, items, totals, print or save as PDF
- **Sales History:** orders saved in the browser (localStorage), view and re-print any receipt

## Technologies
HTML, CSS, vanilla JavaScript, and browser localStorage. No frameworks, no backend, no build step.



## How to print a receipt
Complete an order, click **Print Receipt**, and choose a printer or "Save as PDF".
Only the receipt is printed (the menu, sidebar, and dashboard are hidden).


