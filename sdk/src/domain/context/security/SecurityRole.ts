/*
 *
 * Hedera Asset Tokenization Studio SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

export enum SecurityRole {
  _DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000',
  _ISSUER_ROLE = '0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842',
  _CONTROLLER_ROLE = '0xa72964c08512ad29f46841ce735cff038789243c2b506a89163cc99f76d06c0f',
  _PAUSER_ROLE = '0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb',
  _CONTROLLIST_ROLE = '0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3',
  _CORPORATEACTIONS_ROLE = '0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6',
  _DOCUMENTER_ROLE = '0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41',
  _SNAPSHOT_ROLE = '0x3fbb44760c0954eea3f6cb9f1f210568f5ae959dcbbef66e72f749dbaa7cc2da',
  _LOCKER_ROLE = '0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88',
}

export const MAX_ACCOUNTS_ROLES = 10;

export const SecurityRoleLabel = new Map<SecurityRole, string>([
  [SecurityRole._DEFAULT_ADMIN_ROLE, 'Owner'],
  [SecurityRole._ISSUER_ROLE, 'Issuer'],
  [SecurityRole._CONTROLLER_ROLE, 'Controller'],
  [SecurityRole._PAUSER_ROLE, 'Pause'],
  [SecurityRole._CONTROLLIST_ROLE, 'Control List'],
  [SecurityRole._CORPORATEACTIONS_ROLE, 'Corporate Actions'],
  [SecurityRole._DOCUMENTER_ROLE, 'Documenter'],
  [SecurityRole._SNAPSHOT_ROLE, 'Snapshot'],
  [SecurityRole._LOCKER_ROLE, 'Locker'],
]);
