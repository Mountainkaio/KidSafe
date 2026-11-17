import { useState, useEffect } from "react";
import { FiInfo } from "react-icons/fi";
import { updateSchedule } from "../../api/devices.js";

const weekdays = [
	{ id: 0, label: "D" },
	{ id: 1, label: "S" },
	{ id: 2, label: "T" },
	{ id: 3, label: "Q" },
	{ id: 4, label: "Q" },
	{ id: 5, label: "S" },
	{ id: 6, label: "S" },
];

export default function SchedulePanel({ device, onUpdated }) {
	const [start, setStart] = useState(device?.scheduleStart || "10:00");
	const [end, setEnd] = useState(device?.scheduleEnd || "22:00");
	const [days, setDays] = useState(
		device?.scheduleDays
			? device.scheduleDays.split(",").map(Number)
			: [1, 2, 3, 4, 5]
	);
	const [scheduledBreaks, setScheduledBreaks] = useState(
		device?.scheduledBreaks || false
	);
	const [breakUsageMinutes, setBreakUsageMinutes] = useState(
		device?.breakUsageMinutes || 15
	);
	const [breakDurationMinutes, setBreakDurationMinutes] = useState(
		device?.breakDurationMinutes || 5
	);
	const [status, setStatus] = useState("idle");

	useEffect(() => {
		if (device) {
			setStart(device.scheduleStart || "10:00");
			setEnd(device.scheduleEnd || "22:00");
			setDays(
				device.scheduleDays
					? device.scheduleDays.split(",").map(Number)
					: [1, 2, 3, 4, 5]
			);
			setScheduledBreaks(device.scheduledBreaks || false);
			setBreakUsageMinutes(device.breakUsageMinutes || 15);
			setBreakDurationMinutes(device.breakDurationMinutes || 5);
			setStatus("idle");
		}
	}, [device?.id]);

	function toggleDay(dayId) {
		setDays((current) =>
			current.includes(dayId)
				? current.filter((id) => id !== dayId)
				: [...current, dayId]
		);
	}

	async function handleSave() {
		setStatus("saving");
		try {
			const data = await updateSchedule({
				start,
				end,
				days,
				scheduledBreaks,
				breakUsageMinutes: Math.max(1, Number(breakUsageMinutes) || 15),
				breakDurationMinutes: Math.max(1, Number(breakDurationMinutes) || 5),
				deviceId: device?.id,
			});
			onUpdated(data.device);
			setStatus("saved");
		} catch (error) {
			setStatus("error");
		}
	}

	return (
		<div className="schedule-panel">
			<h1 className="dashboard-panel__title">Horário de uso</h1>

			<div className="schedule-panel__times">
				<label>
					Início
					<input
						type="time"
						value={start}
						onChange={(event) => setStart(event.target.value)}
					/>
				</label>
				<span className="schedule-panel__until">até</span>
				<label>
					Fim
					<input
						type="time"
						value={end}
						onChange={(event) => setEnd(event.target.value)}
					/>
				</label>
			</div>

			<h2 className="schedule-panel__subtitle">Dias funcionais</h2>
			<div className="schedule-panel__days">
				{weekdays.map((day) => (
					<button
						type="button"
						key={day.id}
						className={
							days.includes(day.id)
								? "schedule-panel__day schedule-panel__day--active"
								: "schedule-panel__day"
						}
						onClick={() => toggleDay(day.id)}
					>
						{day.label}
					</button>
				))}
			</div>

			<h2 className="schedule-panel__subtitle">Pausas programadas</h2>
			<div className="schedule-breaks-container">
				<label className="schedule-panel__toggle-row">
					<span>Ativar pausas durante o uso</span>
					<input
						type="checkbox"
						checked={scheduledBreaks}
						onChange={(event) => setScheduledBreaks(event.target.checked)}
					/>
				</label>

				{scheduledBreaks && (
					<div className="schedule-breaks-config">
						<div className="schedule-breaks-grid">
							<label className="schedule-break-field">
								<span className="schedule-break-label">
									Período de uso contínuo (minutos)
								</span>
								<input
									type="number"
									min="1"
									max="180"
									value={breakUsageMinutes}
									onChange={(e) => setBreakUsageMinutes(e.target.value)}
								/>
								<span className="schedule-break-hint">
									A extensão bloqueará a tela ao atingir este tempo.
								</span>
							</label>

							<label className="schedule-break-field">
								<span className="schedule-break-label">
									Duração da pausa (minutos)
								</span>
								<input
									type="number"
									min="1"
									max="60"
									value={breakDurationMinutes}
									onChange={(e) => setBreakDurationMinutes(e.target.value)}
								/>
								<span className="schedule-break-hint">
									A tela será desbloqueada automaticamente após este intervalo.
								</span>
							</label>
						</div>

						<div className="schedule-break-preview">
							<FiInfo style={{ marginRight: "6px", verticalAlign: "middle" }} />
							<strong>Como funcionará:</strong> A cada{" "}
							<strong>{breakUsageMinutes || 15} minutos</strong> de uso, a
							extensão bloqueará a tela por{" "}
							<strong>{breakDurationMinutes || 5} minutos</strong> com uma
							mensagem de descanso e contagem regressiva. Ao término da pausa, a
							tela é desbloqueada automaticamente.
						</div>
					</div>
				)}
			</div>

			<button
				type="button"
				className="button button--primary"
				onClick={handleSave}
				disabled={status === "saving"}
			>
				{status === "saving" ? "Salvando..." : "Salvar horário"}
			</button>

			{status === "saved" && (
				<p className="schedule-panel__feedback">Horário atualizado com sucesso.</p>
			)}
			{status === "error" && (
				<p role="alert">Não foi possível salvar. Tente novamente.</p>
			)}
		</div>
	);
}
