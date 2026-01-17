/**
 * Vault Guardian Feature - Public Exports
 */

export { VaultGuardianManager } from "./vault-guardian-manager";
export { VaultGuardianWarningModal } from "./warning-modal";
export { VaultGuardianHealthReportModal } from "./health-report-modal";
export type { ViolationReport, HealthCheckResult, FolderRule } from "./types";
export { parseAllowedRootFolders, parseFolderRules } from "./types";
