import { Router } from "express";
import { createManualTimeEntry, deleteTimeEntry, getActiveTimeEntry, getTimeEntryById, getTimeReport, startTimeEntry, stopTimeEntry, updateTimeEntry } from "../controllers/timerController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @openapi
 * /api/timers/start:
 *   post:
 *     tags: [Time Entries]
 *     summary: Start a timer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId: { type: string }
 *               description: { type: string }
 *               billable: { type: boolean }
 *     responses:
 *       201:
 *         description: Timer started
 * /api/timers/active:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get the currently running timer
 *     responses:
 *       200:
 *         description: Active time entry or null
 * /api/timers/report:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get time report with aggregations
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Time report data
 */
router.post("/start",protect,startTimeEntry)
router.get("/active",protect,getActiveTimeEntry)
router.get("/report",protect,getTimeReport)

/**
 * @openapi
 * /api/timers:
 *   post:
 *     tags: [Time Entries]
 *     summary: Create a manual time entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startTime, endTime]
 *             properties:
 *               projectId: { type: string }
 *               description: { type: string }
 *               billable: { type: boolean }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Time entry created
 */
router.post("/",protect,createManualTimeEntry)

/**
 * @openapi
 * /api/timers/{id}/stop:
 *   post:
 *     tags: [Time Entries]
 *     summary: Stop a running timer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Timer stopped
 * /api/timers/{id}:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get a time entry by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Time entry data
 *   patch:
 *     tags: [Time Entries]
 *     summary: Update a time entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               billable: { type: boolean }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Time entry updated
 *   delete:
 *     tags: [Time Entries]
 *     summary: Delete a time entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Time entry deleted
 */
router.post("/:id/stop",protect,stopTimeEntry)
router.get("/:id",protect,getTimeEntryById)
router.patch("/:id",protect,updateTimeEntry)
router.delete("/:id",protect,deleteTimeEntry)




export default router;