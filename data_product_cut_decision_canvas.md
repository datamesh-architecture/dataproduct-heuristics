## Data Product Cut – Decision Canvas

Use this canvas to turn heuristic answers into a concrete recommendation. Score honestly and look for clear signals, not perfection.

---

## 1. General viability (mandatory)

Score each question with:

- 2 = yes
- 1 = partially / unclear
- 0 = no

**Clear consumer & use case (max 6)**\
☐ Concrete teams or roles exist now **(0–2)**\
☐ Consumers do not need to stitch other products **(0–2)**\
☐ Purpose fits into one sentence **(0–2)**

**Stable ownership (max 4)**\
☐ One accountable team **(0–2)**\
☐ Owner would credibly own future changes **(0–2)**

**Low integration burden (max 4)**\
☐ Smallest useful standalone unit **(0–2)**\
☐ Consumer can start using it immediately **(0–2)**

**Bounded scope (max 4)**\
☐ Contains only what is needed **(0–2)**\
☐ No speculative future data **(0–2)**

**Distinct SLA & data quality (max 2)**\
☐ Independent latency, freshness, data quality rules **(0–2)**

**Coherent operations (max 2)**\
☐ Similar batch/stream, frequency, latency **(0–2)**

**General score (max 22): \_\_\_\_**

- **< 14 → Not a data product yet**
- **≥ 14 → Continue with archetype check**

---

## 2. Archetype fit (score one at a time)

### Source-aligned (max 10)

☐ One coherent business event type **(0–2)**\
☐ Makes sense on its own **(0–2)**\
☐ Follows domain modules, not whole systems **(0–2)**\
☐ Mostly local dimensions **(0–2)**\
☐ Source data model changes affect only one data product **(0–2)**

**Score: \_\_\_\_**

- ≥ 8 strong fit

---

### Aggregate (max 18)

☐ Three or more teams need same semantics **(0–3)**\
☐ Duplicate integration would be costly **(0–3)**\
☐ Value emerges only after combining sources **(0–3)**\
☐ Derivation is expensive (features, matching) **(0–3)**\
☐ Clear owner for semantics and cost **(0–3)**\
☐ Scope is tight and strong governance can be managed **(0–3)**

**Score: \_\_\_\_**

- ≥ 13 strong fit

---

### Consumer-aligned (max 16)

☐ One clear job to be done **(0–3)**\
☐ Purpose is verb + object **(0–3)**\
☐ Maps roughly to one artifact **(0–3)**\
☐ Boundary follows decision or process **(0–3)**\
☐ Named business consumers **(0–2)**\
☐ No catch-all scope **(0–2)**

**Score: \_\_\_\_**

- ≥ 12 strong fit

---

## 3. Recommendation

- General < 14 → **Rework boundary first**
- Source-aligned ≥ 9 → **Build source-aligned product**
- Aggregate ≥ 13 → **Build aggregate product**
- Consumer-aligned ≥ 12 → **Build consumer-aligned product**
- Multiple fits → **Layer products**
- No archetype fits → **Redesign the cut**

---

## Hard stops

- No owner → Do not build data product
- Multiple domains in source-aligned → Split by domain
- No clear owner for costs → Do not build aggregate
- No named business consumers → Not consumer-aligned

