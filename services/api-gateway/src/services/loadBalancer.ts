// services/loadBalancer.ts
import { ServiceError, SubgraphConfig } from "../types";

export class LoadBalancer {
  private currentIndex: Map<string, number>;
  private instanceHealth: Map<string, boolean>;

  constructor(private subgraphs: SubgraphConfig[]) {
    this.currentIndex = new Map();
    this.instanceHealth = new Map();
    this.initializeHealth();
  }

  private initializeHealth(): void {
    this.subgraphs.forEach((subgraph) => {
      subgraph.instances?.forEach((instance) => {
        this.instanceHealth.set(instance, true);
      });
    });
  }

  // Round-robin selection with health check
  getNextInstance(serviceName: string): string {
    const subgraph = this.subgraphs.find((s) => s.name === serviceName);
    if (!subgraph?.instances?.length) {
      return subgraph?.url || "";
    }

    const instances = subgraph.instances.filter((instance) =>
      this.instanceHealth.get(instance)
    );

    if (!instances.length) {
      throw new ServiceError(serviceName, "No healthy instances available");
    }

    let currentIdx = this.currentIndex.get(serviceName) || 0;
    currentIdx = (currentIdx + 1) % instances.length;
    this.currentIndex.set(serviceName, currentIdx);

    return instances[currentIdx];
  }

  updateInstanceHealth(instance: string, isHealthy: boolean): void {
    this.instanceHealth.set(instance, isHealthy);
  }
}
