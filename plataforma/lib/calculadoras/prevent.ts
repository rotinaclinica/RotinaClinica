// PREVENT — 10-year total CVD risk
// Logistic regression model: Khan SS et al. Circulation 2023
// Coefficients sourced from MDCalc PREVENT implementation

export interface PreventInput {
  sexo: "M" | "F";
  idade: number;          // years, 30–79
  pas: number;            // mmHg
  colesterolTotal: number; // mg/dL (converted to mmol/L internally)
  hdl: number;            // mg/dL (converted to mmol/L internally)
  egfr: number;           // mL/min/1.73m²
  diabetes: boolean;
  tabagismo: boolean;
  estatina: boolean;
  antihipertensivo: boolean;
}

export type PreventCategoria = "baixo" | "intermediario" | "alto";

export interface PreventResult {
  risco10yr: number;
  categoria: PreventCategoria;
}

const COEF = {
  F: {
    cage: 0.7939, cnhdl: 0.0305, chdl: -0.1607,
    csbp: -0.2394, csbp2: 0.36,
    diabetes: 0.8668, smoking: 0.5361,
    cegfr: 0.6046, cegfr2: 0.0434,
    antihtn: 0.3152, statin: -0.1478,
    csbp2_antihtn: -0.0664, cnhdl_statin: 0.1198,
    cage_cnhdl: -0.082, cage_chdl: 0.0307,
    cage_csbp2: -0.0946, cage_diabetes: -0.2706,
    cage_smoking: -0.0787, cage_cegfr: -0.1638,
    constant: -3.3077,
  },
  M: {
    cage: 0.7689, cnhdl: 0.0736, chdl: -0.0954,
    csbp: -0.4347, csbp2: 0.3363,
    diabetes: 0.7693, smoking: 0.4387,
    cegfr: 0.5379, cegfr2: 0.0165,
    antihtn: 0.2889, statin: -0.1337,
    csbp2_antihtn: -0.0476, cnhdl_statin: 0.1503,
    cage_cnhdl: -0.0518, cage_chdl: 0.0191,
    cage_csbp2: -0.1049, cage_diabetes: -0.2252,
    cage_smoking: -0.0895, cage_cegfr: -0.1543,
    constant: -3.0312,
  },
} as const;

export function calcularPrevent(input: PreventInput): PreventResult {
  const c = COEF[input.sexo];

  // Convert mg/dL → mmol/L
  const tc  = input.colesterolTotal / 38.67;
  const hdl = input.hdl / 38.67;

  // Centered/splined transformations
  const cage  = (input.idade - 55) / 10;
  const cnhdl = tc - hdl - 3.5;
  const chdl  = (hdl - 1.3) / 0.3;
  const csbp  = (Math.min(input.pas, 110) - 110) / 20;
  const csbp2 = (Math.max(input.pas, 110) - 130) / 20;
  const cegfr  = (Math.min(input.egfr, 60) - 60) / -15;
  const cegfr2 = (Math.max(input.egfr, 60) - 90) / -15;
  const dm  = input.diabetes ? 1 : 0;
  const smk = input.tabagismo ? 1 : 0;
  const aht = input.antihipertensivo ? 1 : 0;
  const stn = input.estatina ? 1 : 0;

  const x = c.constant
    + c.cage    * cage
    + c.cnhdl   * cnhdl
    + c.chdl    * chdl
    + c.csbp    * csbp
    + c.csbp2   * csbp2
    + c.diabetes * dm
    + c.smoking  * smk
    + c.cegfr    * cegfr
    + c.cegfr2   * cegfr2
    + c.antihtn  * aht
    + c.statin   * stn
    // Interaction terms
    + c.csbp2_antihtn * (csbp2 * aht)
    + c.cnhdl_statin  * (cnhdl * stn)
    + c.cage_cnhdl    * (cage * cnhdl)
    + c.cage_chdl     * (cage * chdl)
    + c.cage_csbp2    * (cage * csbp2)
    + c.cage_diabetes * (cage * dm)
    + c.cage_smoking  * (cage * smk)
    + c.cage_cegfr    * (cage * cegfr);

  const risco10yr = Math.min(99.9, Math.max(0.1,
    (Math.exp(x) / (1 + Math.exp(x))) * 100
  ));

  const categoria: PreventCategoria =
    risco10yr < 7.5  ? "baixo" :
    risco10yr < 20   ? "intermediario" :
                       "alto";

  return { risco10yr: Math.round(risco10yr * 10) / 10, categoria };
}
