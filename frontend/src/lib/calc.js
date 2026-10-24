export const bossFactors = (boss) => {
  const def = Math.max(0, Math.floor((boss.stats.defesa || 0) * 0.5));
  const rawRes = boss.stats.resistencia ? boss.stats.resistencia / 100 : 0.05;
  const res = Math.min(0.95, rawRes * 0.5);
  const red = def > 0 ? Math.min(0.8, def / (def + 100)) : 0;
  return { def, res, red };
};

export const bossHp = (boss, withForm) => (boss.stats.vida || 0) + (withForm ? boss.stats.vidaExtra || 0 : 0);

export const hitDamage = (raw, bonusPct, boss, ignoraDefesa) => {
  const { res, red } = bossFactors(boss);
  const boosted = raw * (1 + (bonusPct || 0) / 100);
  const afterRes = Math.floor(boosted * (1 - res));
  return Math.max(1, ignoraDefesa ? afterRes : Math.floor(afterRes * (1 - red)));
};

export const skillResults = (skills, bonusPct, boss, withForm) => {
  const hp = bossHp(boss, withForm);
  return skills.map((s) => {
    const final = hitDamage(s.dano, bonusPct, boss, s.ignoraDefesa);
    return { ...s, final, pct: (final / hp) * 100, hits: Math.ceil(hp / final) };
  });
};

export const damageSkills = (item, basicLabel) => {
  const out = [];
  item.sections.forEach((s) => {
    const list = s.type === "list" ? s.entries.flatMap((e) => e.skills || []) : s.skills || [];
    list.forEach((sk) => sk.dano > 0 && out.push({ ...sk, origem: s.key }));
  });
  if (item.category === "espadas" && item.stats.dano) {
    out.unshift({ nome: basicLabel, dano: item.stats.dano, cooldown: 0, custoStamina: 0, tags: [], origem: "basico", ignoraDefesa: false });
  }
  return out;
};
