const text = "탄탄하지만 기능성인 옷, 2장, 최대한 빠르게 제작해보고 싶습니다.";
let fText = text;
const qtyMatch = fText.match(/(\d+\s*(?:장|벌|개|pcs|pieces))/i);
if (qtyMatch) {
    fText = fText.replace(qtyMatch[1], '').replace(/^[,\s]+|[,\s]+$/g, '').replace(/,,/g, ',');
}
console.log("fText before split:", fText);
if (fText.length > 15 && fText.includes(', ')) {
    const parts = fText.split(', ');
    fText = parts[0];
}
console.log("Fabric:", fText);
