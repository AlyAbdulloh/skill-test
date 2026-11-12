export const formatNumber = (num: any) => {
    if (!num) return "0";
    return new Intl.NumberFormat("id-ID").format(Number(num));
  };