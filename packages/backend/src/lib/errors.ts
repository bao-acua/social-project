export interface Resource {
  type: string;
  id: string;
}

/** Error representing that the user doesn't have permission to access specified resource  */
export class PermissionError extends Error {
  user: Resource;
  resource: Resource;
  reason: string;
  constructor(reason: string, user: Resource, resource: Resource) {
    super(`Permission error: ${reason}`);
    this.reason = reason;
    this.name = 'PermissionError';
    this.user = user;
    this.resource = resource;
  }
}

/** Error representing that the resource(s) is not in condition interactable by user  */
export class PreconditionError extends Error {
  resources: Resource[];

  reason: string;
  constructor(reason: string, resources: Resource[]) {
    super(`Precondition failed: ${reason}`);
    this.name = 'PreconditionError';
    this.resources = resources;
    this.reason = reason;
  }
}

/** Error representing that specified resource not found  */
export class ResourceNotFoundError extends Error {
  resource: Resource;

  constructor(message: string, resource: Resource) {
    super(`Resource not found: ${message}`);
    this.name = 'ResourceNotFoundError';
    this.resource = resource;
  }
}

/** Error representing conflict (e.g object already exist) */
export class ConflictError extends Error {
  reason: string;
  constructor(reason: string) {
    super(`Conflict: ${reason}`);
    this.name = 'ConflictError';
    this.reason = reason;
  }
}

/** Error representing validation error */
export class ValidationError extends Error {
  reason: string;
  constructor(reason: string) {
    super(`Validation Error: ${reason}`);
    this.name = 'ValidationError';
    this.reason = reason;
  }
}

export class CreateResourceError extends Error {
  reason: string;
  constructor(reason: string) {
    super(`Create resource error: ${reason}`);
    this.name = 'CreateResourceError';
    this.reason = reason;
  }
}
