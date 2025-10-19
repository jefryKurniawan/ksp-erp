// src/utils/handlebars-helpers.ts
import * as handlebars from 'handlebars';

export function registerHandlebarsHelpers() {
  // Helper untuk membandingkan nilai
  handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Helper untuk format currency
  handlebars.registerHelper('currency', function(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  });

  // Helper untuk format date
  handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('id-ID');
  });
}
