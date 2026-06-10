# ADR-001: Upgrade to Spring 6 and Migrate from Resin to Tomcat

| Field       | Value                            |
|-------------|----------------------------------|
| **Status**  | Accepted                         |
| **Date**    | 2026-06-10                       |
| **Authors** | Platform / Build Engineering     |
| **Tickets** | CLOUDPLAT-712, DEVE-376          |
| **PRs**     | ir-csa#656, core#20778           |

---

## 1. Context & Problem Statement

### The Catalyst
The organisation is upgrading the platform (`ir-csa`, `core`, and related consumer repositories) from **Spring 5.3.x to Spring 6.2.x** to stay current with framework support, security patches, and the modern Java ecosystem.

### The Jakarta EE Shift
Spring 6 mandates the move from Java EE (`javax.*`) to Jakarta EE (`jakarta.*`). This requires a large-scale, cross-repository namespace migration affecting Servlets, Persistence, Validation, Annotations, and Mail.

### The Infrastructure Blocker
The current application server, **Resin 4.0.66**, is fundamentally incompatible with the Jakarta EE namespace and modern Spring 6 requirements. The framework upgrade cannot be completed while remaining on Resin.

### Legacy Dependencies
The codebase relies heavily on older Spring features that have been deprecated or removed in Spring 6, including:

- Spring Remoting
- `commons-fileupload`
- EhCache Spring integration
- Spring Social
- SAML support

---

## 2. Decision

### Application Server
Deprecate **Resin 4.0.66** and adopt **Tomcat 11** (specifically `11.0.21`, the current stable release) as the standard application server across all environments.

> *Rationale: Tomcat 11 is the minimum version to support Jakarta EE 10, which is required by Spring 6. All core/Resin applications are already on JDK 21, making Tomcat 11 a natural fit.*

### Framework Upgrades
Proceed with upgrades to:

| Component          | Target Version |
|--------------------|----------------|
| Spring Framework   | 6.2.x          |
| Spring Security    | 6.5.x          |
| Spring Web Flow    | 3.0.x          |

### Persistence
Upgrade **Hibernate to the 5.6.x line** (Jakarta-compatible) rather than jumping to Hibernate 6. This minimises ORM-related regressions while satisfying the Jakarta EE namespace requirement.

### Vendoring Legacy Modules
Deprecated but still-needed Spring modules (e.g., `commons-fileupload`, Spring Social) will be vendored into a dedicated internal producer repository (`spring-attic`). This unblocks the broader platform upgrade without forcing immediate rewrites of all dependent code.

---

## 3. Technical Scope & Execution Strategy

### 3.1 Codebase Namespace Migration
Mechanically replace `javax.*` with `jakarta.*` across:
- Controllers
- Filters
- DAO classes
- Test fixtures

This applies to all affected repositories.

### 3.2 Infrastructure — Staging / GKE
- Update base Docker images to layer in **Tomcat 11** instead of Resin libraries.
- The existing pattern of excluding the Resin watchdog remains valid; Kubernetes continues to act as the deployment controller.

### 3.3 Infrastructure — Production / VMs
- Rewrite and apply changes to the **Puppet modules** responsible for provisioning compute VMs.
- Puppet will install, configure, and manage **Tomcat 11** in place of Resin.
- Jenkins VMs also require Tomcat support where currently running Resin-backed services.

### 3.4 Security Modernisation
Refactor deprecated Spring Security patterns:
- Migrate away from `WebSecurityConfigurerAdapter` to the `SecurityFilterChain` bean approach.

### 3.5 Web & HTTP Client Adjustments
- Migrate shared utilities (e.g., `ImpactRestTemplate`) to **Apache HttpClient 5**.
- Handle the shift from `HttpStatus` to `HttpStatusCode` in Spring MVC exceptions and controllers.

---

## 4. Consequences

### Positive
- **Future-Proofing:** Moves the platform onto actively supported, secure, and modern frameworks (Spring 6, Tomcat 11).
- **Standardisation:** Tomcat 11 is an industry standard with a large community, making debugging, tuning, and knowledge transfer easier compared to Resin.
- **Modernised Tooling:** Promotes upgrades to adjacent libraries, including Hibernate Validator 8.x, Apache HttpClient 5, and GreenMail for testing.

### Negative / Risks

| Risk | Description |
|------|-------------|
| **High Regression Risk** | While namespace changes are mechanical, compatibility fixes (Hibernate flush modes, HTTP client rewrites, Security filter chains) carry a high risk of subtle runtime bugs. |
| **Operational Overhead** | The infrastructure team must build, test, and deploy new Puppet modules for Production VMs in parallel with the development team's code merges. |
| **Technical Debt Maintenance** | Creating `spring-attic` means the organisation takes on the internal maintenance burden of legacy Spring modules indefinitely. |

---

## 5. Alternatives Considered

### Stay on Resin
**Rejected.** Resin 4.0.66 does not support Jakarta EE namespaces and is effectively unmaintained. It is a hard blocker for Spring 6.

### Migrate to Tomcat 10.x
**Rejected.** Tomcat 10.1.x supports Jakarta EE 10 but Tomcat 11 is the stable release aligned with Jakarta EE 11, and all applications are on JDK 21. Tomcat 11 is the recommended target per CLOUDPLAT-712.

### Upgrade Hibernate to 6.x Simultaneously
**Deferred.** Hibernate 6 introduces breaking API changes beyond the `javax.` → `jakarta.` rename. Jumping to Hibernate 5.6.x first reduces the blast radius and allows the team to stabilise the Spring 6 migration before tackling Hibernate 6.

---

## 6. Related Links

| Type   | Reference |
|--------|-----------|
| Ticket | [CLOUDPLAT-712](https://jira.example.com/browse/CLOUDPLAT-712) — Resin → Tomcat |
| Ticket | [DEVE-376](https://jira.example.com/browse/DEVE-376) — Spring 6 upgrade |
| PR     | [ir-csa#656](https://github.com/ImpactInc/ir-csa/pull/656) |
| PR     | [core#20778](https://github.com/ImpactInc/core/pull/20778) |
