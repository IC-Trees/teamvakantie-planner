import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Mail,
  LogOut,
  Check,
  Clock,
  Plus,
  Download,
} from 'lucide-react';

// Dummy data
const initialTeamMembers = [
  { id: 1, name: "Jan Jansen", role: "Developer", avatar: "J" },
  { id: 2, name: "Emma de Vries", role: "Designer", avatar: "E" },
  { id: 3, name: "Lucas Bakker", role: "Project Manager", avatar: "L" },
  { id: 4, name: "Sophie Visser", role: "Marketing", avatar: "S" },
  { id: 5, name: "Tim Hendriks", role: "Developer", avatar: "T" },
];

const initialVacations = [
  { id: 1, userId: 1, start: new Date(2025, 3, 5), end: new Date(2025, 3, 12), status: 'approved', approvedBy: [2, 3, 4, 5], notes: '' },
  { id: 2, userId: 2, start: new Date(2025, 3, 15), end: new Date(2025, 3, 22), status: 'pending', approvedBy: [1, 3], notes: '' },
  { id: 3, userId: 3, start: new Date(2025, 3, 25), end: new Date(2025, 3, 28), status: 'created', approvedBy: [], notes: '' },
  { id: 4, userId: 4, start: new Date(2025, 4, 10), end: new Date(2025, 4, 15), status: 'approved', approvedBy: [1, 2, 3, 5], notes: '' },
  { id: 5, userId: 5, start: new Date(2025, 4, 20), end: new Date(2025, 4, 27), status: 'pending', approvedBy: [1, 2], notes: '' },
];

// Nederlandse feestdagen 2025
const dutchHolidays = [
  { date: new Date(2025, 0, 1), name: "Nieuwjaarsdag" },
  { date: new Date(2025, 3, 18), name: "Goede Vrijdag" },
  { date: new Date(2025, 3, 20), name: "Eerste Paasdag" },
  { date: new Date(2025, 3, 21), name: "Tweede Paasdag" },
  { date: new Date(2025, 4, 5), name: "Bevrijdingsdag" },
  { date: new Date(2025, 4, 29), name: "Hemelvaartsdag" },
  { date: new Date(2025, 5, 8), name: "Eerste Pinksterdag" },
  { date: new Date(2025, 5, 9), name: "Tweede Pinksterdag" },
  { date: new Date(2025, 11, 25), name: "Eerste Kerstdag" },
  { date: new Date(2025, 11, 26), name: "Tweede Kerstdag" }
];

// Helper functies
const isHoliday = (date) => {
  if (!date) return false;
  return dutchHolidays.some(holiday =>
    holiday.date.getDate() === date.getDate() &&
    holiday.date.getMonth() === date.getMonth() &&
    holiday.date.getFullYear() === date.getFullYear()
  );
};

const getHolidayName = (date) => {
  if (!date) return null;
  const holiday = dutchHolidays.find(holiday =>
    holiday.date.getDate() === date.getDate() &&
    holiday.date.getMonth() === date.getMonth() &&
    holiday.date.getFullYear() === date.getFullYear()
  );
  return holiday ? holiday.name : null;
};

const getVacationStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'bg-green-500';
    case 'pending': return 'bg-yellow-500';
    case 'created': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

const getUserName = (userId, teamMembers) => {
  const user = teamMembers.find(member => member.id === userId);
  return user ? user.name : 'Onbekend';
};

// Hoofdtaken in één App component
const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('calendar'); // 'calendar', 'addVacation', 'team'
  const [calendarMode, setCalendarMode] = useState('month'); // 'month' of 'year'
  const [showVacationModal, setShowVacationModal] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(null);
  const [selectedDateModal, setSelectedDateModal] = useState(null);
  const [vacationForm, setVacationForm] = useState({ startDate: '', endDate: '', notes: '' });
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [vacations, setVacations] = useState(initialVacations);
  // Huidige gebruiker (eerste teamlid)
  const [currentUser] = useState(teamMembers[0]);

  // Genereer dagen in de maand (met memoization)
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let date = new Date(year, month, 1);
    const days = [];
    // Voeg lege dagen toe voor opvulling (als de week niet vanaf maandag begint)
    const firstDayWeekday = new Date(year, month, 1).getDay();
    const emptyDays = (firstDayWeekday === 0 ? 6 : firstDayWeekday - 1);
    for (let i = 0; i < emptyDays; i++) {
      days.push({ date: null, day: 'empty' });
    }
    while (date.getMonth() === month) {
      days.push({ date: new Date(date), day: date.getDate() });
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  // Genereer alle maanden van het jaar
  const monthsInYear = useMemo(() => {
    const year = currentDate.getFullYear();
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      // Hergebruik getDaysInMonth logica (zonder memoization hier voor eenvoud)
      let date = new Date(year, month, 1);
      const days = [];
      const firstDayWeekday = new Date(year, month, 1).getDay();
      const emptyDays = (firstDayWeekday === 0 ? 6 : firstDayWeekday - 1);
      for (let i = 0; i < emptyDays; i++) {
        days.push({ date: null, day: 'empty' });
      }
      while (date.getMonth() === month) {
        days.push({ date: new Date(date), day: date.getDate() });
        date.setDate(date.getDate() + 1);
      }
      months.push({
        month: month,
        name: monthStart.toLocaleDateString('nl-NL', { month: 'long' }),
        days: days,
      });
    }
    return months;
  }, [currentDate]);

  // Filtering voor vakanties op een bepaalde datum
  const getVacationsForDate = (date) => {
    if (!date) return [];
    return vacations.filter(vac => {
      let checkDate = new Date(date);
      let startDate = new Date(vac.start);
      let endDate = new Date(vac.end);
      checkDate.setHours(0,0,0,0);
      startDate.setHours(0,0,0,0);
      endDate.setHours(0,0,0,0);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Goedkeuringsfunctie
  const approveVacation = (vacId) => {
    setVacations(prevVacations => prevVacations.map(vac => {
      if (vac.id === vacId) {
        if (!vac.approvedBy.includes(currentUser.id)) {
          const updatedApproved = [...vac.approvedBy, currentUser.id];
          const otherMembers = teamMembers.filter(m => m.id !== vac.userId).map(m => m.id);
          const allApproved = otherMembers.every(id => updatedApproved.includes(id));
          return { ...vac, approvedBy: updatedApproved, status: allApproved ? 'approved' : 'pending' };
        }
      }
      return vac;
    }));
  };

  // Toevoegen van nieuwe vakantie
  const handleAddVacation = () => {
    if (!vacationForm.startDate || !vacationForm.endDate) return;
    const newVacation = {
      id: vacations.length + 1,
      userId: currentUser.id,
      start: new Date(vacationForm.startDate),
      end: new Date(vacationForm.endDate),
      status: 'created',
      approvedBy: [],
      notes: vacationForm.notes,
    };
    setVacations([...vacations, newVacation]);
    setVacationForm({ startDate: '', endDate: '', notes: '' });
    setActiveView('calendar');
  };

  // Navigatie functies
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const formatMonthName = (date) => date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

  // --- Subcomponenten ---
  const Header = () => (
    <header className="bg-blue-600 text-white p-3 md:p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-4">
          <CalendarIcon className="h-5 w-5 md:h-6 md:w-6" />
          <h1 className="text-lg md:text-xl font-semibold">Teamvakantie-planner</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-1.5 md:p-2 rounded-full hover:bg-blue-500 transition-colors">
            <Mail className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-400 flex items-center justify-center text-sm font-bold shadow-sm">
              {currentUser.avatar}
            </div>
            <span className="hidden md:inline">{currentUser.name}</span>
          </div>
          <button className="p-1.5 md:p-2 rounded-full hover:bg-blue-500 transition-colors">
            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>
    </header>
  );

  const NavigationBar = () => (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex justify-between">
          <div className="flex space-x-1 md:space-x-4">
            <button 
              onClick={() => setActiveView('calendar')}
              className={`py-3 md:py-4 px-2 md:px-3 border-b-2 font-medium transition-colors text-sm md:text-base ${activeView === 'calendar' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:border-blue-200 hover:text-blue-500'}`}
            >
              Kalender
            </button>
            <button 
              onClick={() => setActiveView('team')}
              className={`py-3 md:py-4 px-2 md:px-3 border-b-2 font-medium transition-colors text-sm md:text-base ${activeView === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:border-blue-200 hover:text-blue-500'}`}
            >
              Team
            </button>
          </div>
          <div className="py-2 md:py-3">
            <button 
              onClick={() => setActiveView('addVacation')}
              className="bg-blue-600 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-md flex items-center space-x-1 md:space-x-2 hover:bg-blue-700 transition-colors shadow-sm text-sm md:text-base"
            >
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Vakantie</span>
              <span className="hidden md:inline">Toevoegen</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const CalendarView = () => (
    <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
      {/* Kalender header */}
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <button 
          onClick={calendarMode === 'month' ? goToPreviousMonth : () => setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))}
          className="p-1.5 md:p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
        </button>
        <div className="flex items-center space-x-2 md:space-x-4">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-800">
            {calendarMode === 'month' ? formatMonthName(currentDate) : currentDate.getFullYear()}
          </h2>
          <div className="flex border border-gray-300 rounded-md overflow-hidden text-xs md:text-sm">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-2 md:px-3 py-1 ${calendarMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Maand
            </button>
            <button
              onClick={() => setCalendarMode('year')}
              className={`px-2 md:px-3 py-1 ${calendarMode === 'year' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Jaar
            </button>
          </div>
        </div>
        <button 
          onClick={calendarMode === 'month' ? goToNextMonth : () => setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))}
          className="p-1.5 md:p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
        </button>
      </div>
      
      {calendarMode === 'month' && (
        <>
          {/* Weekdagen header */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
              <div key={day} className="text-center font-semibold py-1 md:py-2 text-gray-500 border-b border-gray-200 text-xs md:text-sm">
                {day}
              </div>
            ))}
          </div>
          {/* Maandweergave grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {daysInMonth.map((day, index) => {
              const dayVacations = day.date ? getVacationsForDate(day.date) : [];
              const isToday = day.date && new Date().toDateString() === day.date.toDateString();
              const holiday = day.date ? isHoliday(day.date) : false;
              
              return (
                <div 
                  key={index} 
                  className={`min-h-16 md:min-h-24 border rounded-lg p-1 md:p-2 transition-all ${day.date ? 'bg-white hover:shadow-sm' : 'bg-gray-50'} 
                    ${holiday ? 'border-red-200 bg-red-50' : ''}
                    ${isToday ? 'border-blue-500 border-2 shadow-sm' : dayVacations.length > 0 ? 'border-gray-300' : 'border-gray-200'}`}
                >
                  {day.date && (
                    <>
                      <div 
                        className={`text-right text-xs md:text-sm mb-1 md:mb-2 cursor-pointer font-medium ${(dayVacations.length > 0 || holiday) ? 'hover:text-blue-600' : ''} 
                          ${isToday ? 'text-blue-600' : holiday ? 'text-red-600' : 'text-gray-700'}`}
                        onClick={() => {
                          if (dayVacations.length > 0 || holiday) {
                            setSelectedDateModal({ date: day.date, vacations: dayVacations });
                          }
                        }}
                      >
                        {day.day}
                      </div>
                      {holiday && (
                        <div className="text-xxs md:text-xs text-red-600 font-medium mb-1 md:mb-1.5 bg-red-50 p-0.5 md:p-1 rounded text-center truncate">
                          {getHolidayName(day.date)}
                        </div>
                      )}
                      <div className="space-y-1 md:space-y-1.5">
                        {dayVacations.slice(0, 3).map(vacation => (
                          <div 
                            key={vacation.id}
                            className={`text-xxs md:text-xs p-0.5 md:p-1.5 rounded-md text-white ${getVacationStatusColor(vacation.status)} shadow-sm hover:shadow-md transition-shadow cursor-pointer truncate`}
                            onClick={() => setShowVacationModal(vacation)}
                          >
                            {getUserName(vacation.userId, teamMembers)}
                          </div>
                        ))}
                        {dayVacations.length > 3 && (
                          <div 
                            className="text-xxs md:text-xs p-0.5 md:p-1 text-center text-gray-600 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
                            onClick={() => setSelectedDateModal({ date: day.date, vacations: dayVacations })}
                          >
                            +{dayVacations.length - 3} meer
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {calendarMode === 'year' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {monthsInYear.map(monthData => {
            const monthVacCount = vacations.filter(vac => {
              const startM = vac.start.getMonth();
              const endM = vac.end.getMonth();
              const year = currentDate.getFullYear();
              return ((vac.start.getFullYear() === year && startM === monthData.month) ||
                      (vac.end.getFullYear() === year && endM === monthData.month) ||
                      (vac.start.getFullYear() === year && vac.end.getFullYear() === year &&
                        startM <= monthData.month && endM >= monthData.month));
            }).length;
            const monthHolidays = dutchHolidays.filter(holiday => 
              holiday.date.getMonth() === monthData.month && holiday.date.getFullYear() === currentDate.getFullYear()
            );
            const isCurrentMonth = currentDate.getMonth() === monthData.month && currentDate.getFullYear() === new Date().getFullYear();
            return (
              <div 
                key={monthData.month} 
                className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${isCurrentMonth ? 'border-blue-400 shadow-sm' : 'border-gray-200'}`}
                onClick={() => {
                  setCurrentDate(new Date(currentDate.getFullYear(), monthData.month, 1));
                  setCalendarMode('month');
                }}
              >
                <div className={`p-1.5 md:p-2 text-center font-medium border-b text-sm ${isCurrentMonth ? 'bg-blue-50 text-blue-700' : 'bg-gray-50'}`}>
                  {monthData.name}
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-100">
                  {['M','D','W','D','V','Z','Z'].map((day, idx) => (
                    <div key={idx} className="bg-gray-50 text-center text-xxs md:text-xs text-gray-500 p-0.5 md:p-1">
                      {day}
                    </div>
                  ))}
                  {monthData.days.map((day, idx) => {
                    const holiday = day.date ? isHoliday(day.date) : false;
                    const hasVacation = day.date ? getVacationsForDate(day.date).length > 0 : false;
                    return (
                      <div 
                        key={idx} 
                        className={`w-full h-5 md:h-6 flex items-center justify-center text-xxs md:text-xs ${!day.date ? 'bg-gray-50' : 'bg-white'} ${holiday ? 'bg-red-50 text-red-600 font-medium' : ''} ${hasVacation ? 'font-bold' : ''}`}
                      >
                        {day.date && (
                          <div className="relative">
                            {day.day}
                            {hasVacation && getVacationsForDate(day.date).map((vac, vIdx) => {
                              const offset = vIdx * 4 - (getVacationsForDate(day.date).length - 1) * 2;
                              return (
                                <div 
                                  key={vIdx}
                                  className={`absolute -bottom-1 w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${getVacationStatusColor(vac.status)}`}
                                  style={{ left: `calc(50% + ${offset}px)`, transform: 'translateX(-50%)' }}
                                ></div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="p-1 md:p-2 bg-white border-t">
                  <div className="flex justify-between items-center text-xxs md:text-xs">
                    <div>
                      {monthVacCount > 0 && (<span className="text-blue-600 font-medium">{monthVacCount} vakantie(s)</span>)}
                    </div>
                    <div>
                      {monthHolidays.length > 0 && (<span className="text-red-600 font-medium">{monthHolidays.length} feestdag(en)</span>)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Legenda */}
      <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4 bg-gray-50 p-2 md:p-3 rounded-lg text-xs md:text-sm">
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-3 md:w-4 h-3 md:h-4 bg-green-500 rounded-full shadow-sm"></div>
          <span>Goedgekeurd</span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-3 md:w-4 h-3 md:h-4 bg-yellow-500 rounded-full shadow-sm"></div>
          <span>In afwachting</span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-3 md:w-4 h-3 md:h-4 bg-gray-500 rounded-full shadow-sm"></div>
          <span>Aangemaakt</span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-3 md:w-4 h-3 md:h-4 bg-red-200 rounded-full shadow-sm"></div>
          <span>Feestdag</span>
        </div>
      </div>
    </div>
  );

  const TeamView = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-3 md:p-5 border-b border-gray-200">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Team Overzicht</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {teamMembers.map(member => {
          const memberVacations = vacations.filter(v => v.userId === member.id);
          return (
            <div key={member.id} className="p-3 md:p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg text-gray-800">{member.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              {memberVacations.length === 0 ? (
                <p className="text-xs md:text-sm text-gray-500 ml-2 italic">Geen geplande vakanties</p>
              ) : (
                <div className="space-y-2 md:space-y-3 ml-2">
                  {memberVacations.map(vac => {
                    const totalRequired = teamMembers.length - 1;
                    const approvalPercentage = totalRequired > 0 ? Math.round((vac.approvedBy.length / totalRequired) * 100) : 0;
                    return (
                      <div 
                        key={vac.id}
                        className="flex items-center border border-gray-200 rounded-lg p-2 md:p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => setShowApprovalModal(vac)}
                      >
                        <div className={`w-3 md:w-4 h-3 md:h-4 rounded-full ${getVacationStatusColor(vac.status)} mr-3 md:mr-4 shadow-sm`}></div>
                        <div className="flex-grow">
                          <p className="text-xs md:text-sm font-medium text-gray-800">
                            {vac.start.toLocaleDateString('nl-NL')} t/m {vac.end.toLocaleDateString('nl-NL')}
                          </p>
                          <div className="flex items-center mt-1 md:mt-2">
                            <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2.5 mr-2 md:mr-3 flex-grow shadow-inner">
                              <div 
                                className={`h-1.5 md:h-2.5 rounded-full ${vac.status === 'approved' ? 'bg-green-500' : vac.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'}`}
                                style={{ width: `${approvalPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xxs md:text-xs font-medium text-gray-600 whitespace-nowrap">
                              {vac.approvedBy.length}/{totalRequired} goedkeuringen
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 md:ml-3 text-xxs md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium shadow-sm whitespace-nowrap" 
                          style={{
                            backgroundColor: vac.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : vac.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: vac.status === 'approved' ? 'rgb(21, 128, 61)' : vac.status === 'pending' ? 'rgb(161, 98, 7)' : 'rgb(55, 65, 81)'
                          }}
                        >
                          {vac.status === 'approved' ? 'Goedgekeurd' : vac.status === 'pending' ? 'In afwachting' : 'Aangemaakt'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const AddVacationView = () => (
    <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
      <div className="mb-3 md:mb-4 border-b pb-2">
        <h2 className="text-lg md:text-xl font-semibold">Nieuwe Vakantie Toevoegen</h2>
      </div>
      <div className="space-y-3 md:space-y-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Startdatum</label>
          <input
            type="date"
            value={vacationForm.startDate}
            onChange={(e) => setVacationForm({ ...vacationForm, startDate: e.target.value })}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Einddatum</label>
          <input
            type="date"
            value={vacationForm.endDate}
            onChange={(e) => setVacationForm({ ...vacationForm, endDate: e.target.value })}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Opmerkingen</label>
          <textarea
            value={vacationForm.notes}
            onChange={(e) => setVacationForm({ ...vacationForm, notes: e.target.value })}
            className="w-full p-2 border rounded-md text-sm"
            rows="3"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button onClick={() => setActiveView('calendar')} className="px-3 md:px-4 py-1.5 md:py-2 border rounded-md text-sm">Annuleren</button>
          <button onClick={handleAddVacation} className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-md text-sm shadow-sm hover:bg-blue-700 transition-colors">Toevoegen</button>
        </div>
      </div>
    </div>
  );

  // --- Modals ---
  const VacationDetailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-20">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-3 md:p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-base md:text-lg font-semibold">Vakantie Details</h2>
          <button onClick={() => setShowVacationModal(null)} className="text-gray-500 p-1 rounded-full hover:bg-gray-100">×</button>
        </div>
        <div className="p-3 md:p-4 space-y-2 md:space-y-3">
          <div className="flex justify-between">
            <span className="font-medium text-sm md:text-base">Medewerker:</span>
            <span className="text-sm md:text-base">{getUserName(showVacationModal.userId, teamMembers)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-sm md:text-base">Periode:</span>
            <span className="text-sm md:text-base">{showVacationModal.start.toLocaleDateString('nl-NL')} t/m {showVacationModal.end.toLocaleDateString('nl-NL')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-sm md:text-base">Status:</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 md:w-3 h-2.5 md:h-3 rounded-full ${getVacationStatusColor(showVacationModal.status)}`}></div>
              <span className="text-sm md:text-base">{showVacationModal.status === 'approved' ? 'Goedgekeurd' : showVacationModal.status === 'pending' ? 'In afwachting' : 'Aangemaakt'}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-sm md:text-base">Goedgekeurd door:</span>
            <span className="text-sm md:text-base">{showVacationModal.approvedBy.length ? `${showVacationModal.approvedBy.length} teamleden` : 'Nog niemand'}</span>
          </div>
          {showVacationModal.notes && (
            <div className="mt-2">
              <span className="font-medium text-sm md:text-base">Opmerkingen:</span>
              <p className="text-xs md:text-sm mt-1 text-gray-700">{showVacationModal.notes}</p>
            </div>
          )}
        </div>
        <div className="p-3 md:p-4 border-t flex justify-end sticky bottom-0 bg-white">
          {showVacationModal.userId !== currentUser.id && !showVacationModal.approvedBy.includes(currentUser.id) && showVacationModal.status !== 'approved' && (
            <button 
              onClick={() => { approveVacation(showVacationModal.id); setShowVacationModal(null); }}
              className="flex items-center space-x-1 bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md text-sm shadow-sm hover:bg-green-700 transition-colors"
            >
              <Check className="h-3.5 md:h-4 w-3.5 md:w-4" />
              <span>Goedkeuren</span>
            </button>
          )}
          {showVacationModal.userId !== currentUser.id && showVacationModal.approvedBy.includes(currentUser.id) && (
            <div className="text-green-600 flex items-center space-x-1 text-sm">
              <Check className="h-3.5 md:h-4 w-3.5 md:w-4" />
              <span>Je hebt deze vakantie al goedgekeurd</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ApprovalModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 md:p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-3 md:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg sticky top-0">
          <h2 className="text-base md:text-lg font-semibold text-gray-800">Goedkeuringen Status</h2>
          <button onClick={() => setShowApprovalModal(null)} className="text-gray-500 hover:text-gray-700 transition-colors rounded-full w-7 md:w-8 h-7 md:h-8 flex items-center justify-center hover:bg-gray-200">
            ×
          </button>
        </div>
        <div className="p-3 md:p-5">
          <div className="mb-4 md:mb-5 bg-gray-50 p-2 md:p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium text-sm md:text-base text-gray-800">Vakantie van {getUserName(showApprovalModal.userId, teamMembers)}</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              {showApprovalModal.start.toLocaleDateString('nl-NL')} t/m {showApprovalModal.end.toLocaleDateString('nl-NL')}
            </p>
            <div className="flex items-center space-x-2 mt-1 md:mt-2">
              <div className={`w-2.5 md:w-3 h-2.5 md:h-3 rounded-full ${getVacationStatusColor(showApprovalModal.status)}`}></div>
              <span className="text-xs md:text-sm font-medium" style={{
                  color: showApprovalModal.status === 'approved' ? 'rgb(21, 128, 61)' : showApprovalModal.status === 'pending' ? 'rgb(161, 98, 7)' : 'rgb(55, 65, 81)'
                }}>
                {showApprovalModal.status === 'approved' ? 'Goedgekeurd' : showApprovalModal.status === 'pending' ? 'In afwachting' : 'Aangemaakt'}
              </span>
            </div>
          </div>
          <div className="space-y-1 mb-4 md:mb-5">
            <h3 className="font-medium text-sm md:text-base text-gray-800 mb-2 border-b pb-1">Goedgekeurd door:</h3>
            {showApprovalModal.approvedBy.length === 0 ? (
              <p className="text-xs md:text-sm text-gray-600 italic">Nog niemand heeft goedgekeurd</p>
            ) : (
              <div className="space-y-1">
                {teamMembers.filter(member => showApprovalModal.approvedBy.includes(member.id)).map(member => (
                  <div key={member.id} className="flex items-center space-x-2 md:space-x-3 py-1.5 md:py-2 px-2 md:px-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {member.avatar}
                    </div>
                    <span className="text-xs md:text-sm font-medium text-gray-800">{member.name}</span>
                    <Check className="h-4 md:h-5 w-4 md:w-5 text-green-600 ml-auto" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-sm md:text-base text-gray-800 mb-2 border-b pb-1">Wachten op goedkeuring van:</h3>
            {teamMembers.filter(member => member.id !== showApprovalModal.userId && !showApprovalModal.approvedBy.includes(member.id)).length === 0 ? (
              <p className="text-xs md:text-sm text-gray-600 italic">Geen wachtende goedkeuringen</p>
            ) : (
              <div className="space-y-1">
                {teamMembers.filter(member => member.id !== showApprovalModal.userId && !showApprovalModal.approvedBy.includes(member.id))
                  .map(member => (
                    <div key={member.id} className="flex items-center space-x-2 md:space-x-3 py-1.5 md:py-2 px-2 md:px-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {member.avatar}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-800">{member.name}</span>
                      <Clock className="h-4 md:h-5 w-4 md:w-5 text-gray-400 ml-auto" />
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
        <div className="p-3 md:p-4 border-t border-gray-200 flex justify-end space-x-2 md:space-x-3 bg-gray-50 rounded-b-lg sticky bottom-0">
          {(!showApprovalModal.approvedBy.includes(currentUser.id)) && (currentUser.id !== showApprovalModal.userId) && (
            <button 
              onClick={() => { approveVacation(showApprovalModal.id); setShowApprovalModal(null); }}
              className="flex items-center space-x-1 md:space-x-2 bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md shadow-sm hover:bg-green-700 transition-colors text-xs md:text-sm"
            >
              <Check className="h-3 md:h-4 w-3 md:w-4" />
              <span>Goedkeuren</span>
            </button>
          )}
          <button onClick={() => setShowApprovalModal(null)} className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-xs md:text-sm">
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );

  const DateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 md:p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-3 md:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg sticky top-0">
          <h2 className="text-base md:text-lg font-semibold text-gray-800">
            Vakanties op {selectedDateModal.date.toLocaleDateString('nl-NL')}
          </h2>
          <button onClick={() => setSelectedDateModal(null)} className="text-gray-500 hover:text-gray-700 transition-colors rounded-full w-7 md:w-8 h-7 md:h-8 flex items-center justify-center hover:bg-gray-200">×</button>
        </div>
        <div className="p-3 md:p-5">
          {isHoliday(selectedDateModal.date) && (
            <div className="p-2 md:p-3 border border-red-200 bg-red-50 rounded-lg mb-3 md:mb-4">
              <p className="font-medium text-red-700 text-sm md:text-base">Feestdag: {getHolidayName(selectedDateModal.date)}</p>
              <p className="text-xs md:text-sm text-red-600 mt-1">Officiële Nederlandse feestdag</p>
            </div>
          )}
          {selectedDateModal.vacations.length === 0 && !isHoliday(selectedDateModal.date) ? (
            <p className="text-xs md:text-sm text-gray-600">Geen vakanties gepland op deze datum.</p>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {selectedDateModal.vacations.map(vac => (
                <div 
                  key={vac.id}
                  className="p-2 md:p-3 border border-gray-200 rounded-lg flex items-center space-x-2 md:space-x-3 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => { setSelectedDateModal(null); setShowVacationModal(vac); }}
                >
                  <div className={`w-2.5 md:w-3 h-2.5 md:h-3 rounded-full ${getVacationStatusColor(vac.status)}`}></div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800 text-sm md:text-base">{getUserName(vac.userId, teamMembers)}</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {vac.start.toLocaleDateString('nl-NL')} t/m {vac.end.toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="text-xxs md:text-xs py-0.5 md:py-1 px-1.5 md:px-2 rounded-full font-medium" 
                    style={{
                      backgroundColor: vac.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : vac.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: vac.status === 'approved' ? 'rgb(21, 128, 61)' : vac.status === 'pending' ? 'rgb(161, 98, 7)' : 'rgb(55, 65, 81)'
                    }}
                  >
                    {vac.status === 'approved' ? 'Goedgekeurd' : vac.status === 'pending' ? 'In afwachting' : 'Aangemaakt'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 md:p-4 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg sticky bottom-0">
          <button onClick={() => setSelectedDateModal(null)} className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-xs md:text-sm">
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );

  // --- Render Hoofdcomponent ---
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <NavigationBar />
      <main className="flex-grow container mx-auto p-2 md:p-4 overflow-y-auto">
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'team' && <TeamView />}
        {activeView === 'addVacation' && <AddVacationView />}
      </main>
      <footer className="bg-white shadow p-3 md:p-4 mt-auto">
        <div className="container mx-auto flex flex-col xs:flex-row justify-between items-center">
          <p className="text-xs md:text-sm text-gray-600 mb-2 xs:mb-0">© 2025 Teamvakantie-planner</p>
          <button className="flex items-center space-x-1 text-xs md:text-sm text-blue-600">
            <Download className="h-3 w-3 md:h-4 md:w-4" />
            <span>Exporteren naar andere kalender</span>
          </button>
        </div>
      </footer>
      {showVacationModal && <VacationDetailModal />}
      {showApprovalModal && <ApprovalModal />}
      {selectedDateModal && <DateModal />}
    </div>
  );
};

export default App;
