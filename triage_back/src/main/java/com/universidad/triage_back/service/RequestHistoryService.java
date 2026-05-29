package com.universidad.triage_back.service;
import com.universidad.triage_back.dto.request.CreateHistoryRequest;
import com.universidad.triage_back.dto.response.RequestHistoryResponse;
import java.util.List;
public interface RequestHistoryService {
    List<RequestHistoryResponse> getHistoryByRequestId(Long requestId);
    RequestHistoryResponse createHistoryEntry(Long requestId, CreateHistoryRequest request);
}
