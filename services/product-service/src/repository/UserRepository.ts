import User from "../models/User";
import { IUser } from "../interfaces/UserInterface";
import { BaseRepository } from "./BaseRepository";
import { PipelineStage } from "mongoose";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }
  // Method to get paginated users
  async getAllUser(
    page: number,
    pageSize: number
  ): Promise<{
    users: IUser[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      // Calculate pagination
      const skip = (page - 1) * pageSize;
      // Perform aggregation
      const result = await User.aggregate(
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
        users: paginatedResults,
        totalCount,
        totalPages,
      };
    } catch (err) {
      console.error("Error fetching users:", err);
      throw new Error("Error fetching users");
    }
  }

  async getUserDetails(params: any) {
    try {
      let aggregate = await User.aggregate([
        { $match: params },
        {
          $lookup: {
            "from": "roles",
            let: { role: "$role" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$role"] }
                    ]
                  }
                }
              },
              {
                $project: {
                  _id: "$_id",
                  role: "$role",
                  roleDisplayName: "$roleDisplayName"
                }
              }
            ],
            "as": "role"
          }
        },
        { "$unwind": "$role" },
        {
          $project: {
            password: 0,
            isDeleted: 0,
            updatedAt: 0,
          }
        }
      ]);
      if (!aggregate) return null;
      return aggregate;
    } catch (e) {
      throw new Error("Error fetching users");
    }

  }


  // async getAllClient(param: any): Promise<IUser[]> {
  //   try {

  //     console.log("Hello")
  //     let conditions: any = {};
  //     let and_clauses: any = [];

  //     let sortOperator: any = { "$sort": {} };
  //     var sortOrder = 1
  //     if ((param.order) && param.order.lenght) {
  //       for (let order of param.order) {
  //         let sortField = param.columns[+order.column].data;
  //         if (order.dir == 'desc') {
  //           sortOrder = -1;
  //         } else if (order.dir == 'asc') {
  //           sortOrder = 1;
  //         }
  //         sortOperator["$sort"][sortField] = sortOrder;
  //       }
  //     } else {
  //       sortOperator["$sort"]['_id'] = -1;
  //     }

  //     and_clauses.push({ isDeleted: false, 'user_role.role': 'client' });
  //     conditions['$and'] = and_clauses;

  //     let aggregate: PipelineStage[] = [
  //       {
  //         $lookup: {
  //           from: 'roles',
  //           let: { role: '$role' },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $and: [
  //                     { $eq: ['$_id', '$$role'] },
  //                     { $eq: ['$isDeleted', false] }
  //                   ]
  //                 }
  //               }
  //             }
  //           ],
  //           as: 'user_role'
  //         }
  //       },
  //       { $unwind: '$user_role' },
  //       {
  //         $group: {
  //           _id: '$_id',
  //           full_name: { $first: '$fullName' },
  //           isDeleted: { $first: '$isDeleted' },
  //           status: { $first: '$status' },
  //           user_role: { $first: '$user_role' },
  //           profile_image: { $first: '$profile_image' },
  //           createdAt: { $first: '$createdAt' },
  //           phone: { $first: '$phone' },
  //           email: { $first: '$email' }
  //         }
  //       },
  //       { $match: conditions },
  //       { $sort: sortOperator },
  //       {
  //         $project: {
  //           user_role: 0,
  //         }
  //       }
  //     ];

  //     // Execute the aggregation pipeline
  //     let allClientUser = await User.aggregate(aggregate).exec();

  //     return allClientUser;
  //   } catch (e) {
  //     console.error(e);
  //     throw e;
  //   }
  // };


  async getAllClient(param: any): Promise<IUser[]> {
    try {
      console.log("Hello");
      let conditions: any = {};
      let and_clauses: any = [];
  
      // Define sortOperator directly
      let sortOperator: any = {};
      let sortOrder = 1;
  
      if (param.order && param.order.length) {
        for (let order of param.order) {
          let sortField = param.columns[+order.column].data;
          sortOrder = order.dir === 'desc' ? -1 : 1;
          sortOperator[sortField] = sortOrder;
        }
      } else {
        sortOperator['_id'] = -1;
      }
  
      // Add conditions for the query
      and_clauses.push({ isDeleted: false, 'user_role.role': 'client' });
      conditions['$and'] = and_clauses;
  
      // Define aggregation pipeline
      let aggregate: PipelineStage[] = [
        {
          $lookup: {
            from: 'roles',
            let: { role: '$role' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$role'] },
                      { $eq: ['$isDeleted', false] }
                    ]
                  }
                }
              }
            ],
            as: 'user_role'
          }
        },
        { $unwind: '$user_role' },
        {
          $group: {
            _id: '$_id',
            full_name: { $first: '$fullName' },
            isDeleted: { $first: '$isDeleted' },
            status: { $first: '$status' },
            user_role: { $first: '$user_role' },
            profile_image: { $first: '$profile_image' },
            createdAt: { $first: '$createdAt' },
            phone: { $first: '$phone' },
            email: { $first: '$email' }
          }
        },
        { $match: conditions },
        { $sort: sortOperator }, // Use $sort directly
        {
          $project: {
            user_role: 0
          }
        }
      ];
  
      // Execute the aggregation pipeline
      let allClientUser = await User.aggregate(aggregate).exec();
  
      return allClientUser;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
