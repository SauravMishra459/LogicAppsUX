export interface IWindowsProcessTree {
  /**
   * Returns a list of processes containing the rootPid process and all of its descendants.
   * @param rootPid - The pid of the process of interest.
   * @param callback - The callback to use with the returned set of processes.
   * @param flags - The flags for what process data should be included.
   */
  getProcessList(rootPid: number, callback: (processList: IProcessInfo[]) => void, flags?: ProcessDataFlag): void;
}

export enum ProcessDataFlag {
  None = 0,
  Memory = 1,
  CommandLine = 2,
}

export interface IProcessInfo {
  pid: number;
  ppid: number;
  name: string;

  /**
   * The working set size of the process, in bytes.
   */
  memory?: number;

  /**
   * The string returned is at most 512 chars, strings exceeding this length are truncated.
   */
  commandLine?: string;
}

export interface IProcessTreeNode {
  pid: number;
  name: string;
  memory?: number;
  commandLine?: string;
  children: IProcessTreeNode[];
}
