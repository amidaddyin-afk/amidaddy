export function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function includedGstPaise(grossPaise: number, gstRate = 18) {
  return Math.round(grossPaise - grossPaise / (1 + gstRate / 100));
}
