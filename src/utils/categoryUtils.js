export function findProductCategory(nodes = [], pointName = "") {
  const target = nodes.find((item) => item && item.text === pointName);
  return target && target.data ? target.data.cid : "";
}
