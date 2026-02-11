const allowed_charectors = "0123456789abcdefghijklmnopqrstuvwxyz";
const mid_char = "i";
const first_char = "0";
const last_char = "z";
export const order_resolver = (LB_str, TB_str) => {
  if (!TB_str) {
    let new_LB_str = LB_str + "0",
      new_TB_str;
    if (LB_str[LB_str.length - 1] === last_char) {
      new_TB_str = LB_str + last_char;
    } else {
      new_TB_str = LB_str.slice(0, -1) + last_char;
    }
    return order_resolver(new_LB_str, new_TB_str);
  }
  if (!LB_str) LB_str = first_char;
  let ptr = 0;
  let LB_char = LB_str[0];
  let TB_char = TB_str[0];
  let final_order = "";
  for (let i = 0; i < TB_str.length; i++) {
    if (ptr < LB_str.length) LB_char = LB_str[ptr];
    TB_char = TB_str[i];
    if (TB_char === LB_char) {
      final_order = final_order + TB_char;
      ptr++;
      continue;
    }
    let pos_LB_char = allowed_charectors.indexOf(LB_char);
    let pos_TB_char = allowed_charectors.indexOf(TB_char);
    let mid = Math.floor((pos_LB_char + pos_TB_char) / 2);
    if (pos_LB_char === mid) {
      return final_order + LB_char + mid_char;
    } else {
      return final_order + allowed_charectors[mid];
    }
  }
  return null;
};
