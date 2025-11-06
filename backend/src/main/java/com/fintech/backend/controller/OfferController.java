package com.fintech.backend.controller;

import com.fintech.backend.model.Offer;
import com.fintech.backend.repository.OfferRepository;
import com.fintech.backend.repository.StartupsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.fintech.backend.model.Investment;
import com.fintech.backend.repository.InvestmentRepository;
import com.fintech.backend.model.Startup;


@RestController
@RequestMapping("/api/offers")
public class OfferController {
    @Autowired
    private InvestmentRepository investmentRepository;

    private final OfferRepository repository;
    private final StartupsRepository startupsRepository;
    @Autowired
    public OfferController(OfferRepository repository, StartupsRepository startupsRepository) {
        this.repository = repository;
        this.startupsRepository = startupsRepository;
    }


    // Получить все (с простыми фильтрами через query params)
    // /api/offers?startupId=...&investorId=...&status=...&visibility=...
    @GetMapping
    public ResponseEntity<List<Offer>> list(
            @RequestParam(required = false) String startupId,
            @RequestParam(required = false) String investorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String visibility
    ) {
        if (startupId != null) return ResponseEntity.ok(repository.findByStartupId(startupId));
        if (investorId != null) return ResponseEntity.ok(repository.findByInvestorId(investorId));
        if (status != null) return ResponseEntity.ok(repository.findByStatus(status));
        if (visibility != null) return ResponseEntity.ok(repository.findByVisibility(visibility));
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Offer> getById(@PathVariable String id) {
        Optional<Offer> opt = repository.findById(id);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Offer> create(@RequestBody Offer payload) {
        payload.setCreatedAt(Instant.now());
        payload.setUpdatedAt(Instant.now());
        // по умолчанию статус если не передан
        if (payload.getStatus() == null) payload.setStatus("sent");
        Offer saved = repository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Offer> replace(@PathVariable String id, @RequestBody Offer payload) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(payload.getTitle());
            existing.setStartupId(payload.getStartupId());
            existing.setInvestorId(payload.getInvestorId());
            existing.setAmount(payload.getAmount());
            existing.setEquityPercent(payload.getEquityPercent());
            existing.setType(payload.getType());
            existing.setVisibility(payload.getVisibility());
            existing.setStatus(payload.getStatus());
            existing.setAttachments(payload.getAttachments());
            existing.setNote(payload.getNote());
            existing.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(repository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Быстрая смена статуса оффера (например accept/reject/counter).
     * Запрос: PATCH /api/offers/{id}/status
     * Тело: { "status": "accepted", "note": "..." }
     */
    public static class StatusUpdate {
        public String status;
        public String note;
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Offer> updateStatus(@PathVariable String id, @RequestBody StatusUpdate body) {
        return repository.findById(id).map(existing -> {
            if (body.status != null) existing.setStatus(body.status);
            if (body.note != null) existing.setNote(body.note);
            existing.setUpdatedAt(Instant.now());
            Offer savedOffer = repository.save(existing);

            // Если оффер принят — создаём инвестицию и обновляем valuationPostMoney
            if ("accepted".equalsIgnoreCase(body.status)) {
                Investment investment = new Investment();
                investment.setStartupId(savedOffer.getStartupId());
                investment.setInvestorId(savedOffer.getInvestorId());
                investment.setAmount(savedOffer.getAmount());
                investment.setEquityPercent(savedOffer.getEquityPercent());
                investment.setStatus("active");
                investment.setCreatedAt(Instant.now());
                investment.setUpdatedAt(Instant.now());

                // ---- НОВАЯ ЛОГИКА: вычисление valuationPostMoney ----
                Double valuationPostMoney; // вместо int
                Optional<Startup> optStartup = startupsRepository.findById(savedOffer.getStartupId());
                if (optStartup.isPresent()) {
                    Startup startup = optStartup.get();
                    Double pre = null;
                    if (startup.getMetricsSnapshot() != null) {
                        pre = startup.getMetricsSnapshot().getValuationPreMoney();
                    }
                    double preVal = (pre == null) ? 0.0 : pre;
                    valuationPostMoney = preVal + (savedOffer.getAmount() == 0 ? 0.0 : savedOffer.getAmount());

                    if (startup.getMetricsSnapshot() == null) {
                        Startup.MetricsSnapshot ms = new Startup.MetricsSnapshot();
                        ms.setValuationPreMoney(preVal);
                        ms.setValuationPostMoney(valuationPostMoney);
                        startup.setMetricsSnapshot(ms);
                    } else {
                        startup.getMetricsSnapshot().setValuationPostMoney(valuationPostMoney);
                    }
                    startup.setUpdatedAt(Instant.now());
                    startupsRepository.save(startup);
                } else {
                    valuationPostMoney = (double) savedOffer.getAmount();
                }

                investment.setValuationPostMoney(valuationPostMoney);

                investmentRepository.save(investment);
            }

            return ResponseEntity.ok(savedOffer);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }


}
