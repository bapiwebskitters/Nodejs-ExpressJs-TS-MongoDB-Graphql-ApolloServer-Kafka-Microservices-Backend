import Service from "../models/Service";
import { IService } from "../interfaces/ServiceInterface";
import { BaseRepository } from "./BaseRepository";

export class ServiceRepository extends BaseRepository<IService> {
  constructor() {
    super(Service);
  }
  // Method to get paginated services
  async getAllService(
    page: number,
    pageSize: number
  ): Promise<{
    services: IService[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      // Calculate pagination
      const skip = (page - 1) * pageSize;
      // Perform aggregation
      const result = await Service.aggregate(
        [
          {
            $match: {
              isDeleted: false,
            },
          },
          {
            $facet: {
              paginatedResults: [
                { $skip: skip },
                { $limit: pageSize },
                { $sort: { _id: -1 } },
              ],
              totalCount: [{ $count: "count" }],
            },
          },
          {
            $project: {
              paginatedResults: 1,
              totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
              totalPages: {
                $ceil: {
                  $divide: [
                    { $arrayElemAt: ["$totalCount.count", 0] },
                    pageSize,
                  ],
                },
              },
            },
          },
        ],
        { allowDiskUse: true }
      );

      // Extract results
      const { paginatedResults, totalCount, totalPages } = result[0];

      return {
        services: paginatedResults,
        totalCount,
        totalPages,
      };
    } catch (err) {
      console.error("Error fetching services:", err);
      throw new Error("Error fetching services");
    }
  }
}

