---
"@hashgraph/asset-tokenization-contracts": patch
---

Move bond-specific facets out of `facets/layer_2/` into top-level `facets/` subdirectories. [BBND-1764]

- `layer_2/amortization/` → `facets/amortization/` (`Amortization`, `AmortizationFacet`, `IAmortization`)
- `layer_2/interestRate/fixedRate/` → `facets/fixedRate/` (`FixedRate`, `FixedRateFacet`, `IFixedRate`)
- `layer_2/interestRate/kpiLinkedRate/` → `facets/kpiLinkedRate/` (`KpiLinkedRate`, `KpiLinkedRateFacet`, `IKpiLinkedRate`)
- `layer_2/kpi/kpiLatest/` → `facets/kpi/` (`Kpis`, `KpisFacet`, `IKpis`)
