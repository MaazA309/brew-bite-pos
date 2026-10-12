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

## How to run
**Option 1 – VS Code Live Server**
1. Open the `brew-bite-pos` folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and choose "Open with Live Server".

**Option 2 – Directly:** double-click `index.html` to open it in your browser.

## How to print a receipt
Complete an order, click **Print Receipt**, and choose a printer or "Save as PDF".
Only the receipt is printed (the menu, sidebar, and dashboard are hidden).

## Upload to GitHub and publish with GitHub Pages
1. Create a GitHub account and click **New repository**. Name it `brew-bite-pos`, keep it **Public**, and click **Create repository**.
2. In VS Code, open the project folder and open the terminal (Terminal → New Terminal).
3. Run these commands (replace `YOUR-USERNAME`):
```
   git init
   git add .
   git commit -m "Brew & Bite POS first version"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/brew-bite-pos.git
   git push -u origin main
```
4. On GitHub, open the repository → **Settings** → **Pages**.
5. Under "Build and deployment", set Source to **Deploy from a branch**, choose branch **main** and folder **/ (root)**, then click **Save**.
6. Wait 1–2 minutes. Your site will be at `https://YOUR-USERNAME.github.io/brew-bite-pos/`

## Notes
- Orders are stored in the browser you use. Another browser or device will have its own separate history.
- Clearing browser data also deletes saved orders.

## Author
Your Name – University of Gujrat