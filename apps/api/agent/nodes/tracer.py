from datetime import datetime, timezone
from agent.state import AgentState

def emit_trace(state: AgentState, node: str, reasoning: str, 
               action: str, inputs: dict, result: dict, next_node: str) -> dict:
    entry = {
        "step": len(state["trace"]) + 1,
        "node": node,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "reasoning": reasoning,
        "action": action,
        "inputs": inputs,
        "result": result,
        "next": next_node,
    }
    # User requested to add console at different important stages in the terminal
    print(f"\n[{datetime.now(timezone.utc).isoformat()}] [AGENT TRACE - Node: {node}]")
    print(f"Action: {action}")
    print(f"Reasoning: {reasoning}")
    print(f"Next Node: {next_node}")
    
    return entry
