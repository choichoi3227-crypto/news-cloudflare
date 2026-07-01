export async function logAdminAction(env: Env, actor: string, action: string, target?: string, metadata: Record<string, unknown> = {}) {
  await env.DB.prepare('INSERT INTO admin_audit_log (id, actor, action, target, metadata_json) VALUES (?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), actor, action, target || null, JSON.stringify(metadata))
    .run();
}
