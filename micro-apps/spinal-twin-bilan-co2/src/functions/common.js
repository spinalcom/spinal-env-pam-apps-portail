export function colorCalc (val) {
  if(val == -1) return 'E';
  else if (val < 40) return 'G3';
  else if (val < 80) return 'G2';
  else if (val < 120) return 'G1';
  else if (val < 160) return 'Y';
  else if (val < 200) return 'O2';
  else if (val < 240) return 'O1';
  else return 'R';
}