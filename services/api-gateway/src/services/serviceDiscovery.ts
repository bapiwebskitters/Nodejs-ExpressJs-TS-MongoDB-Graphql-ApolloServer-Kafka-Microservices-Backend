// services/serviceDiscovery.ts
import { Etcd3 } from "etcd3";
import { SubgraphConfig } from "../types";

export class ServiceDiscovery {
  private etcd: Etcd3;
  private serviceWatchers: Map<string, { cancel: () => void }> = new Map();

  constructor(private onServiceUpdate: (services: SubgraphConfig[]) => void) {
    this.etcd = new Etcd3({
      hosts: process.env.ETCD_HOSTS?.split(",") || ["localhost:2379"],
    });
  }

  async registerService(service: SubgraphConfig): Promise<void> {
    const key = `/services/${service.name}`;
    try {
      await this.etcd.put(key).value(JSON.stringify(service));
      console.log(`Service registered: ${service.name}`);
    } catch (error) {
      console.error(`Failed to register service ${service.name}:`, error);
    }
  }

  async unregisterService(serviceName: string): Promise<void> {
    const key = `/services/${serviceName}`;
    try {
      await this.etcd.delete().key(key);
      console.log(`Service unregistered: ${serviceName}`);
    } catch (error) {
      console.error(`Failed to unregister service ${serviceName}:`, error);
    }
  }

  async watchServices(): Promise<void> {
    try {
      const watcher = await this.etcd.watch().prefix("/services/").create();
      watcher
        .on("put", async (res) => {
          const services = await this.getAllServices();
          this.onServiceUpdate(services);
          console.log(`Service updated: ${res.key.toString()}`);
        })
        .on("delete", async (res) => {
          const services = await this.getAllServices();
          this.onServiceUpdate(services);
          console.log(`Service deleted: ${res.key.toString()}`);
        });

      // Store the global watcher for future management
      this.serviceWatchers.set("global", { cancel: () => watcher.cancel() });
      console.log("Service discovery watcher initialized.");
    } catch (error) {
      console.error("Failed to initialize service watcher:", error);
    }
  }

  async getServiceUrl(serviceName: string): Promise<string | null> {
    const key = `/services/${serviceName}`;
    console.log("key =======", key);
    
    try {
      const serviceData = await this.etcd.get(key).string();
      console.log("=============serviceData===========", serviceData);
      
      if (serviceData) {
        const service: SubgraphConfig = JSON.parse(serviceData);
        return service.url;
      } else {
        console.warn(`Service ${serviceName} not found in registry.`);
        return null;
      }
    } catch (error) {
      console.error(`Failed to get URL for service ${serviceName}:`, error);
      return null;
    }
  }

  async getAllServices(): Promise<SubgraphConfig[]> {
    try {
      const services: SubgraphConfig[] = [];
      const servicesRaw = await this.etcd
        .getAll()
        .prefix("/services/")
        .strings();

      for (const [, value] of Object.entries(servicesRaw)) {
        services.push(JSON.parse(value));
      }
      return services;
    } catch (error) {
      console.error("Failed to retrieve services:", error);
      return [];
    }
  }

  async reinitializeWatchers(): Promise<void> {
    for (const { cancel } of this.serviceWatchers.values()) {
      cancel();
    }
    this.serviceWatchers.clear();
    await this.watchServices();
    console.log("Service watchers reinitialized.");
  }

  async close(): Promise<void> {
    for (const { cancel } of this.serviceWatchers.values()) {
      cancel();
    }
    await this.etcd.close();
    console.log("Service discovery closed.");
  }
}
