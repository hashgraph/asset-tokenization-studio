export default class BaseEntity {
  public toPrimitive(): object {
    let res = {};
    Object.entries(this).map(([key, value]) => {
      res = { ...res, [key]: value };
    });
    return res;
  }
}
