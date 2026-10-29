"""Explanation service. Decisions are always made by deterministic rules; this only words the explanation.
An external LLM could implement `Explainer` behind VERIFYAI_LLM, but the prototype never needs one."""
import os
class Explainer:
    def explain(self, status, title, reason, action) -> str: raise NotImplementedError
class RuleBasedExplainer(Explainer):
    LEAD = {"Pass": "No concern was identified by this check.",
            "Potential Deficiency": "This check indicates a potential deficiency that the official should verify.",
            "Manual Review Required": "This check could not be concluded automatically and needs the official's judgement.",
            "Not Applicable": "This requirement does not appear to apply to this application."}
    def explain(self, status, title, reason, action):
        return f"{self.LEAD.get(status, '')} {reason} Suggested action: {action}".strip()
def get_explainer() -> Explainer:
    # Optional LLM-backed explainer would be returned here when configured; otherwise rule-based fallback.
    return RuleBasedExplainer()
