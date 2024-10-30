import Branch from "../models/Branch";
import { IBranch } from "../interfaces/BranchInterface";
import { BaseRepository } from "./BaseRepository";


export class BrachRepository extends BaseRepository<IBranch> {
  constructor() {
    super(Branch);
  }
  // Method to get paginated branch
  async getAllBranch(
    page: number,
    pageSize: number
  ): Promise<{
    branch: IBranch[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      // Calculate pagination
      const skip = (page - 1) * pageSize;
      // Perform aggregation
      const result = await Branch.aggregate(
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
        branch: paginatedResults,
        totalCount,
        totalPages,
      };
    } catch (err) {
      console.error("Error fetching Branch:", err);
      throw new Error("Error fetching Branch");
    }
  }

}
  